const express = require('express');
const router = express.Router();

// Маршрут для получения списка пользователей
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

module.exports = router;
