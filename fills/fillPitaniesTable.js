const { Sequelize, DataTypes } = require('sequelize');
const { faker } = require('@faker-js/faker/locale/ru');

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
// Импорт модели Pitanie
const Pitanie = require('../models/Pitanie')(sequelize, DataTypes);

// Список видов животных и соответствующих изображений
const vidList = ['обезьяна', 'крыса', 'попугай', 'кошка', 'собака', 'рыбки', 'черепаха', 'кролик', 'еж', 'хомяк'];
const imageMapping = {
  обезьяна: 'obe.jpg',
  крыса: 'krisa.png',
  попугай: 'popygai.png',
  кошка: 'cat.png',
  собака: 'dog.png',
  рыбки: 'ribi.png',
  черепаха: '4er.jpg',
  кролик: 'krol.png',
  еж: 'ez.jpeg',
  хомяк: 'xom.png',
};

// Список названий кормов
const names = [
  'Корм для собак',
  'Корм для кошек',
  'Приправка для попугаев',
  'Сухой корм для рыб',
  'Витамины для черепах',
  'Лакомство для крыс',
  'Добавка для ежей',
  'Консервы для кошек',
  'Зерновая смесь для попугаев',
  'Травяная добавка для хомяков',
];

// Список брендов
const brands = ['Kitekat', 'Pedigree', 'Whiskas', 'Royal Canin', 'Hill\'s', 'Pro Plan', 'Brit', '1st Choice', 'Nutra Nuggets', 'Eukanuba'];

// Функция для создания записей
async function fillPitanieTable(count) {
  try {
    // Синхронизация модели с базой данных
    await sequelize.sync();
    for (let i = 0; i < count; i++) {
      const vid = faker.helpers.arrayElement(vidList); // Сохраняем случайное значение в переменную vid
      const item = await Pitanie.create({
        name: `${faker.helpers.arrayElement(names)}_${i}`,
        vid: vid, // Используем сохраненное значение vid
        brand: faker.helpers.arrayElement(brands),
        weight: faker.number.int({ min: 100, max: 1000 }),
        price: parseFloat(faker.finance.amount(10, 1000, 2)),
        in_stock: faker.datatype.boolean(),
        description: faker.lorem.sentence(10),
        img: `/images/pitanie/${imageMapping[vid]}`, // Используем сохраненное значение vid
      });
      console.log(`Запись #${i + 1} успешно создана.`);
    }
    console.log(`${count} записей успешно создано.`);
  } catch (err) {
    console.error('Ошибка при создании записей:', err);
  } finally {
    await sequelize.close(); // Закрываем соединение с базой данных
  }
}

// Запуск скрипта
const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
  console.error('Укажите корректное количество записей.');
  process.exit(1);
}

fillPitanieTable(count);
