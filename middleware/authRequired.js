const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Импортируем модель User

module.exports = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).redirect('/auth/login'); // Перенаправляем на страницу входа, если токена нет

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }, // Исключаем поле password
    });

    if (!user) return res.status(403).redirect('/auth/login'); // Пользователь не найден

    req.user = user; // Сохраняем пользователя в запросе
    next();
  } catch (err) {
    return res.status(403).redirect('/auth/login'); // Недействительный токен
  }
};
