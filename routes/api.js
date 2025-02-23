const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const Pitanie = require('../models/Pitanie');

// Маршрут для получения списка питомцев
router.get('/pets', async (req, res) => {
  try {
    const pets = await Pet.findAll(); // Получаем всех питомцев из базы данных
    res.json(pets); // Возвращаем их в виде JSON
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pets', error: err.message });
  }
});

// Маршрут для создания нового питомца
router.post('/pets', async (req, res) => {
  const { name, species, age, gender, description, price, available, img } = req.body;
  if (!name || !species || age == null || !gender || price == null) {
    return res.status(400).json({ message: 'All required fields are not provided' });
  }
  try {
    const newPet = await Pet.create({
      name,
      species,
      age: parseInt(age, 10),
      gender,
      description,
      price: parseFloat(price),
      available: available === 'true',
      img,
    });
    res.status(201).json(newPet);
  } catch (err) {
    res.status(500).json({ message: 'Error creating pet', error: err.message });
  }
});

// Маршрут для получения списка продуктов питания
router.get('/pitanie', async (req, res) => {
  try {
    const products = await Pitanie.findAll(); // Получаем все продукты из базы данных
    res.json(products); // Возвращаем их в виде JSON
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

// Маршрут для создания нового продукта питания
router.post('/pitanie', async (req, res) => {
  const { name, vid, brand, weight, description, price, in_stock, img } = req.body;
  if (!name || !vid || !brand || weight == null || price == null) {
    return res.status(400).json({ message: 'All required fields are not provided' });
  }
  try {
    const newProduct = await Pitanie.create({
      name,
      vid,
      brand,
      weight: parseFloat(weight),
      description,
      price: parseFloat(price),
      in_stock: in_stock === 'true',
      img,
    });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
});

// Маршрут для обновления продукта питания
router.put('/pitanie/:id', async (req, res) => {
  const productId = req.params.id;
  const { name, vid, brand, weight, description, price, in_stock, img } = req.body;
  if (!name || !vid || !brand || weight == null || price == null) {
    return res.status(400).json({ message: 'All required fields are not provided' });
  }
  try {
    const updatedProduct = await Pitanie.update(
      {
        name,
        vid,
        brand,
        weight: parseFloat(weight),
        description,
        price: parseFloat(price),
        in_stock: in_stock === 'true',
        img,
      },
      { where: { id: productId } }
    );
    if (updatedProduct[0] === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
});

// Маршрут для удаления продукта питания
router.delete('/pitanie/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const deletedProduct = await Pitanie.destroy({ where: { id: productId } });
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
});

module.exports = router;
