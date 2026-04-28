const User = require('./User');
const MenuItem = require('./MenuItem');
const { Order, OrderItem, StatusHistory } = require('./Order');
const Reservation = require('./Reservation');
const Bill = require('./Bill');

// User <-> Order
User.hasMany(Order, { foreignKey: 'UserId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'UserId', as: 'customer' });

// User <-> Reservation
User.hasMany(Reservation, { foreignKey: 'UserId', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'UserId', as: 'customer' });

// Order <-> Bill
Order.hasOne(Bill, { foreignKey: 'OrderId', as: 'bill' });
Bill.belongsTo(Order, { foreignKey: 'OrderId', as: 'order' });

// User <-> Bill (Issued by)
User.hasMany(Bill, { foreignKey: 'IssuedById', as: 'issuedBills' });
Bill.belongsTo(User, { foreignKey: 'IssuedById', as: 'issuer' });

const { sequelize } = require('../config/database');

module.exports = {
  User,
  MenuItem,
  Order,
  OrderItem,
  StatusHistory,
  Reservation,
  Bill,
  sequelize
};
