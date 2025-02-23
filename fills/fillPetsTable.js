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

// Импорт модели Pet
const Pet = require('../models/Pet')(sequelize, DataTypes);

// Список видов животных и соответствующих изображений
const speciesList = {
  попугай: 'popygai.jpg',
  рыбки: 'ribi.jpg',
  обезьяна: 'obez.jpg',
  собака: 'dog.jpg',
  кошка: 'cat.jpeg',
  кролик: 'krolik.jpg',
  крыса: 'krisa.jpg',
  еж: 'ezh.jpeg',
  хомяк: 'homyak.jpg',
  черепаха: '4erepaxa.jpeg',
};

// Список имен питомцев
const petNames = [
  'Барсик', 'Мурка', 'Рекс', 'Тузик', 'Гав', 'Масяня', 'Шрек', 'Пушок', 'Кеша', 'Чип', 'Дейл',
  'Гоша', 'Васька', 'Леопольд', 'Филя', 'Малыш', 'Нуфар', 'Матроскин', 'Шарик', 'Бобик', 'Том',
  'Джerry', 'Симба', 'Белла', 'Луна', 'Барон', 'Мила', 'Лео', 'Алиса', 'Макс', 'Джек', 'Лизzy',
  'Смоки', 'Бастер', 'Мисcу', 'Оскар', 'Мистер', 'Принцессa', 'Бруно', 'Коко', 'Софи', 'Барбос',
  'Бонифаций', 'Марсель', 'Гектор', 'Люси', 'Дина', 'Кинг', 'Скай', 'Бамби', 'Нева', 'Леди',
  'Мираж', 'Зевс', 'Афина', 'Геракл', 'Меркурий', 'Венера', 'Аполлон', 'Артемида', 'Пандора',
];

// Список описаний
const descriptions = [
  'Дружелюбный и игривый питомец, который станет отличным компаньоном.',
  'Любит проводить время на улице и играть с детьми.',
  'Идеально подходит для семьи с детьми или одиноких людей.',
  'Умное животное, легко обучается новым командам.',
  'Требует особого внимания и регулярного ухода.',
  'Спокойный и нежный характер, прекрасно ладит с другими животными.',
  'Активный и энергичный, нуждается в постоянных физических нагрузках.',
  'Обожает долгие прогулки и игры на свежем воздухе.',
  'Идеальный выбор для тех, кто ценит тишину и спокойствие.',
  'Необычная внешность и уникальный характер делают его особенным.',
];

// Функция для создания записей
async function fillPetsTable(count) {
  try {
    // Синхронизация модели с базой данных
    await sequelize.sync();

    for (let i = 0; i < count; i++) {
      const species = faker.helpers.arrayElement(Object.keys(speciesList));

      const pet = await Pet.create({
        name: faker.helpers.arrayElement(petNames),
        species,
        age: faker.number.int({ min: 1, max: 20 }),
        gender: faker.helpers.arrayElement(['мужской', 'женский']),
        description: faker.helpers.arrayElement(descriptions),
        price: faker.number.int({ min: 10, max: 1000 }),
        available: faker.datatype.boolean(),
        img: `/images/pets/${speciesList[species]}`,
      });

      console.log(`Запись #${i + 1} успешно создана.`);
    }

    console.log(`${count} записей успешно создано.`);
  } catch (err) {
    console.error('Ошибка при создании записи:', err);
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

fillPetsTable(count);
