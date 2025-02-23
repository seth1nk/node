const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Импортируем модель пользователя

// Маршрут для главной страницы
router.get('/', async (req, res) => {
  try {
    let username = null;

    // Проверяем наличие токена в cookie или заголовке
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        // Декодируем токен
        const decoded = require('jsonwebtoken').verify(token, 'your_secret_key');
        const user = await User.findByPk(decoded.userId);
        username = user ? user.username : null;
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }

    // Рендерим шаблон и передаем имя пользователя
    res.render('index', { username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});

module.exports = router;
