const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgresql://uz28jfwl9er7qlvy7kg7:K5ZLDCYHSy5WBlUKMG0pV3JneE53Ve@b1nfwip6gxcxk3htfqvv-postgresql.services.clever-cloud.com:50013/b1nfwip6gxcxk3htfqvv', {
    dialect: 'postgres',
    logging: false, // Отключите логирование SQL запросов в production для чистоты логов
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    define: {
        // Можно определить глобальные опции для всех моделей
        timestamps: true, // Добавляет createdAt и updatedAt
        underscored: true, // Использует snake_case для автоматически создаваемых полей (вроде внешних ключей)
    }
});

const User = require('./User')(sequelize, DataTypes);
const Jewelry = require('./Jewelry')(sequelize, DataTypes);
const Order = require('./Orders')(sequelize, DataTypes);

sequelize.sync({ alter: true })
    .then(() => console.log('Models synchronized with database'))
    .catch(err => console.error('Error synchronizing models:', err));

module.exports = {
    sequelize,
    User,
    Jewelry,
    Order,
};
