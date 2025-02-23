const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Импортируем модель User из models/index.js

router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Маршрут для обработки регистрации
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем нового пользователя с ролью "user"
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });

    // Возвращаем успешный ответ
    res.status(201).json({ message: 'Регистрация успешна!', user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});

// Маршрут для отображения страницы входа
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Маршрут для входа
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя по email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Сверяем пароли
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      'your_secret_key',
      { expiresIn: '1h' }
    );

    // Сохраняем токен в cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 1 * 60 * 60 * 1000 }); // Токен действителен 1 час

    // Возвращаем успешный ответ
    res.json({ message: 'Вход выполнен успешно', token });
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});
router.get('/logout', (req, res) => {
  try {
    res.clearCookie('token'); // Очищаем токен из cookies
    res.redirect('/'); // Перенаправляем на страницу входа
  } catch (err) {
    console.error('Ошибка выхода:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});
// Маршрут для выхода
router.post('/logout', (req, res) => {
  try {
    // Очищаем токен из cookies
    res.clearCookie('token');

    // Возвращаем успешный JSON-ответ
    res.json({ message: 'Успешно вышли из аккаунта' });
  } catch (err) {
    console.error('Ошибка выхода:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});

// Маршрут для проверки токена
router.get('/check', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    const user = await User.findByPk(decoded.userId);

    if (!user) return res.status(403).json({ message: 'Пользователь не найден' });

    // Возвращаем имя пользователя
    res.json({ username: user.username, email: user.email, role: user.role });
  } catch (err) {
    res.status(403).json({ message: 'Недействительный токен' });
  }
});
module.exports = router;
