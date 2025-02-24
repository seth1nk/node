const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');
const multer = require('multer');
const authMiddleware = require('./middleware/auth');
const authRequired = require('./middleware/authRequired');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');

const app = express();

// Подключение к PostgreSQL
const sequelize = new Sequelize('postgresql://u5faad9yt3ckk8mt496b:kWV07DWGv3tPVW6rVQKKa1ZpYby5LS@bigg1ypf9gwcyyw1p7kt-postgresql.services.clever-cloud.com:50013/bigg1ypf9gwcyyw1p7kt', {
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Импорт моделей
const { User, Pet, Pitanie } = require('./models');

// Синхронизация моделей с базой данных
sequelize.sync()
  .then(() => console.log('Models synchronized with database'))
  .catch(err => console.error('Error synchronizing models:', err));

// Middleware
app.use(logger('dev'));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: 'https://glowing-biscochitos-d161ed.netlify.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Роуты
app.use('/auth', authRouter);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('images', express.static(path.join(__dirname, 'public/images')));

// Главная страница
app.get('/', async (req, res) => {
  let username = null;
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = require('jsonwebtoken').verify(token, 'your_secret_key');
      const user = await User.findByPk(decoded.userId);
      username = user ? user.username : null;
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }
  res.render('index', { username });
});
// Получение списка питомцев
app.get('/api/pets', async (req, res) => {
  try {
    const pets = await Pet.findAll();
    const formattedPets = pets.map(pet => ({
      ...pet.dataValues,
      img: pet.img ? `/images/${pet.img}` : null,
    }));
    res.json(formattedPets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching pets', error: err.message });
  }
});

// Получение списка продуктов питания
app.get('/api/pitanies', async (req, res) => {
  try {
    const pitanies = await Pitanie.findAll();
    const formattedPitanies = pitanies.map(pitanie => ({
      ...pitanie.dataValues,
      img: pitanie.img ? `/images/${pitanie.img}` : null,
    }));
    res.json(formattedPitanies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching pitanies', error: err.message });
  }
});

// Добавление нового питомца
app.post('/add-pet', upload.single('image'), async (req, res) => {
  try {
    const { name, species, age, gender, description, price, available } = req.body;

    if (!name || !species || age == null || !gender || price == null) {
      return res.status(400).json({ message: 'All required fields are not provided' });
    }

    const pet = await Pet.create({
      name,
      species,
      age: parseInt(age, 10),
      gender: gender.toLowerCase() === 'мужской' ? 'мужской' : 'женский',
      description,
      price: parseFloat(price),
      available: available === 'on',
      img: req.file ? `${req.file.filename}` : null,
    });

    res.redirect('/list-pets');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating pet', error: err.message });
  }
});

// Добавление нового продукта питания
app.post('/add-pitanie', upload.single('image'), async (req, res) => {
  try {
    const { name, vid, brand, weight, description, price, in_stock } = req.body;

    if (!name || !vid || !brand || weight == null || price == null) {
      return res.status(400).json({ message: 'All required fields are not provided' });
    }

    const product = await Pitanie.create({
      name,
      vid,
      brand,
      weight: parseFloat(weight),
      description,
      price: parseFloat(price),
      in_stock: in_stock === 'on',
      img: req.file ? `${req.file.filename}` : null,
    });

    res.redirect('/list-pitanie');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
});
// Маршрут для просмотра питомца
app.get('/view-pet/:id', async (req, res) => {
  const petId = req.params.id;
  try {
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).send('Pet not found');
    res.render('view-pet', { pet });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pet', error: err.message });
  }
});

// Маршрут для просмотра продукта питания
app.get('/view-pitanie/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Pitanie.findByPk(productId);
    if (!product) return res.status(404).send('Product not found');
    res.render('view-pitanie', { product });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
});

// Маршрут для редактирования питомца (GET)
app.get('/edit-pet/:id', async (req, res) => {
  const petId = req.params.id;
  try {
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).send('Pet not found');
    res.render('edit-pet', { pet });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pet', error: err.message });
  }
});

// Маршрут для редактирования продукта питания (GET)
app.get('/edit-pitanie/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Pitanie.findByPk(productId);
    if (!product) return res.status(404).send('Product not found');
    res.render('edit-pitanie', { product });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
});

// Маршрут для удаления питомца
app.get('/delete-pet/:id', async (req, res) => {
  const petId = req.params.id;
  try {
    const deletedPet = await Pet.findByPk(petId);
    if (!deletedPet) return res.status(404).send('Pet not found');

    // Удалить изображение, если оно существует
    if (deletedPet.img) {
      const imagePath = path.join(__dirname, 'public', deletedPet.img);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Удаляем файл
      }
    }

    await Pet.destroy({ where: { id: petId } });
    res.redirect('/list-pets');
  } catch (err) {
    res.status(500).json({ message: 'Error deleting pet', error: err.message });
  }
});

// Маршрут для обновления питомца (POST)
app.post('/edit-pet/:id', upload.single('image'), async (req, res) => {
  const petId = req.params.id;
  const { name, species, age, gender, description, price, available } = req.body;

  try {
    const existingPet = await Pet.findByPk(petId);
    if (!existingPet) return res.status(404).send('Pet not found');

    // Если новый файл был загружен, удалить старый файл
    if (req.file && existingPet.img) {
      const oldImagePath = path.join(__dirname, 'public', existingPet.img);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Удаляем старый файл
      }
    }

    // Преобразуем поле "gender" в нижний регистр
    const normalizedGender = gender.toLowerCase() === 'мужской' ? 'мужской' : 'женский';

    const updatedData = {
      name,
      species,
      age: parseInt(age, 10),
      gender: normalizedGender,
      description,
      price: parseFloat(price),
      available: available === 'on',
      img: req.file ? `/images/${req.file.filename}` : existingPet.img,
    };

    await Pet.update(updatedData, { where: { id: petId } });
    res.redirect('/list-pets');
  } catch (err) {
    res.status(500).json({ message: 'Error updating pet', error: err.message });
  }
});

// Маршрут для обновления продукта питания (POST)
app.post('/edit-pitanie/:id', upload.single('image'), async (req, res) => {
  const productId = req.params.id;
  const { name, vid, brand, weight, description, price, in_stock } = req.body;

  try {
    const existingProduct = await Pitanie.findByPk(productId);
    if (!existingProduct) return res.status(404).send('Product not found');

    // Если новый файл был загружен, удалить старый файл
    if (req.file && existingProduct.img) {
      const oldImagePath = path.join(__dirname, 'public', existingProduct.img);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Удаляем старый файл
      }
    }

    const updatedData = {
      name,
      vid,
      brand,
      weight: parseFloat(weight),
      description,
      price: parseFloat(price),
      in_stock: in_stock === 'on',
      img: req.file ? `/images/${req.file.filename}` : existingProduct.img,
    };

    await Pitanie.update(updatedData, { where: { id: productId } });
    res.redirect('/list-pitanie');
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
});

// Маршрут для удаления продукта питания
app.get('/delete-pitanie/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const deletedProduct = await Pitanie.findByPk(productId);
    if (!deletedProduct) return res.status(404).send('Product not found');

    // Удалить изображение, если оно существует
    if (deletedProduct.img) {
      const imagePath = path.join(__dirname, 'public', deletedProduct.img);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Удаляем файл
      }
    }

    await Pitanie.destroy({ where: { id: productId } });
    res.redirect('/list-pitanie');
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
});

// Маршрут для списка питомцев с пагинацией
app.get('/list-pets', authRequired, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  try {
    const petsCount = await Pet.count();
    const totalPages = Math.ceil(petsCount / limit);

    const pets = await Pet.findAll({
      offset: (page - 1) * limit,
      limit,
    });

    res.render('list-pets', { pets, currentPage: page, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching pets', error: err.message });
  }
});

// Маршрут для списка продуктов питания с пагинацией
app.get('/list-pitanie', authRequired, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  try {
    const productsCount = await Pitanie.count();
    const totalPages = Math.ceil(productsCount / limit);

    const products = await Pitanie.findAll({
      offset: (page - 1) * limit,
      limit,
    });

    res.render('list-pitanie', { products, currentPage: page, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});
// Подключение роутеров
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// Обработка ошибок
app.use((req, res, next) => {
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
