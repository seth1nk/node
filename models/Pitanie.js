module.exports = (sequelize, DataTypes) => {
  const Pitanie = sequelize.define('Pitanie', {
    name: { type: DataTypes.STRING, allowNull: false },
    vid: { type: DataTypes.STRING, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    weight: { type: DataTypes.FLOAT, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.FLOAT, allowNull: false },
    in_stock: { type: DataTypes.BOOLEAN, defaultValue: true },
    img: { type: DataTypes.STRING },
  });
  return Pitanie;
};
