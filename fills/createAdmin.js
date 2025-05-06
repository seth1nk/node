const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Подключение к PostgreSQL (Clever Cloud)
const sequelize = new Sequelize('postgresql://uz28jfwl9er7qlvy7kg7:K5ZLDCYHSy5WBlUKMG0pV3JneE53Ve@b1nfwip6gxcxk3htfqvv-postgresql.services.clever-cloud.com:50013/b1nfwip6gxcxk3htfqvv', {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

(async () => {
  try {
    // Синхронизация модели с базой данных
    await sequelize.sync();

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('Q1qqqqqq', 10);

    // Создаем администратора
    const admin = await User(sequelize, DataTypes).create({
      username: 'admin',
      email: 'admin@mail.ru',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Администратор успешно создан:', admin.toJSON());
  } catch (err) {
    console.error('Ошибка при создании администратора:', err);
  } finally {
    await sequelize.close();
  }
})();
