const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    defaultValue: () => 'LOC' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5).toUpperCase()
  },
  customerName: { type: DataTypes.STRING, allowNull: false },
  customerPhone: { type: DataTypes.STRING, allowNull: false },
  customerEmail: DataTypes.STRING,
  street: DataTypes.STRING,
  city: { type: DataTypes.STRING, defaultValue: 'Tamil Nadu' },
  pincode: DataTypes.STRING,
  landmark: DataTypes.STRING,
  orderType: {
    type: DataTypes.ENUM('delivery', 'takeaway', 'dine-in'),
    defaultValue: 'delivery'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'preparing', 'dispatched', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  subtotal: { type: DataTypes.FLOAT, allowNull: false },
  tax: { type: DataTypes.FLOAT, allowNull: false },
  deliveryCharge: { type: DataTypes.FLOAT, defaultValue: 40 },
  discount: { type: DataTypes.FLOAT, defaultValue: 0 },
  couponCode: DataTypes.STRING,
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'upi', 'online'),
    defaultValue: 'cash'
  },
  notes: DataTypes.TEXT,
  estimatedDelivery: DataTypes.DATE
});

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  subtotal: { type: DataTypes.FLOAT, allowNull: false }
});

const StatusHistory = sequelize.define('StatusHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: { type: DataTypes.STRING, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  note: DataTypes.STRING
});

// Associations
Order.hasMany(OrderItem, { as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order);

Order.hasMany(StatusHistory, { as: 'statusHistory', onDelete: 'CASCADE' });
StatusHistory.belongsTo(Order);

module.exports = { Order, OrderItem, StatusHistory };
