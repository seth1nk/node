const { Sequelize, DataTypes } = require('sequelize');

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
const User = require('./User')(sequelize, DataTypes);
const Pet = require('./Pet')(sequelize, DataTypes);
const Pitanie = require('./Pitanie')(sequelize, DataTypes);

// Синхронизация моделей с базой данных
sequelize.sync()
  .then(() => console.log('Models synchronized with database'))
  .catch(err => console.error('Error synchronizing models:', err));

// Экспорт моделей и sequelize
module.exports = {
  sequelize,
  User,
  Pet,
  Pitanie,
};
