const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reservationId: {
    type: DataTypes.STRING,
    unique: true,
    defaultValue: () => 'RES' + Date.now().toString().slice(-6)
  },
  customerName: { type: DataTypes.STRING, allowNull: false },
  customerPhone: { type: DataTypes.STRING, allowNull: false },
  customerEmail: DataTypes.STRING,
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 20
    }
  },
  tableNumber: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  specialRequest: DataTypes.STRING,
  occasion: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  adminNote: DataTypes.STRING
});

module.exports = Reservation;
