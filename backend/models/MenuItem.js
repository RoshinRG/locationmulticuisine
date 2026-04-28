const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  category: {
    type: DataTypes.ENUM('starters', 'biryani', 'grills', 'shawarma', 'seafood', 'desserts', 'drinks', 'south-indian', 'north-indian', 'chinese', 'veg', 'mandi', 'broasted'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 300]
    }
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: '/images/default-food.jpg'
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  preparationTime: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  isVeg: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = MenuItem;
