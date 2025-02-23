module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    name: { type: DataTypes.STRING, allowNull: false },
    species: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, defaultValue: 0 },
    gender: { type: DataTypes.ENUM('мужской', 'женский'), allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.FLOAT, allowNull: false },
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
    img: { type: DataTypes.STRING },
  });
  return Pet;
};
