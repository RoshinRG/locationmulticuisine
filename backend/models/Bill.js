const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bill = sequelize.define('Bill', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    unique: true,
    defaultValue: () => 'INV' + new Date().getFullYear() + Date.now().toString().slice(-6)
  },
  customerName: DataTypes.STRING,
  customerPhone: DataTypes.STRING,
  customerEmail: DataTypes.STRING,
  // Storing items as JSON string in SQLite
  itemsJson: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('itemsJson');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('itemsJson', JSON.stringify(value));
    }
  },
  subtotal: { type: DataTypes.FLOAT, allowNull: false },
  cgst: DataTypes.FLOAT,
  sgst: DataTypes.FLOAT,
  totalTax: DataTypes.FLOAT,
  deliveryCharge: { type: DataTypes.FLOAT, defaultValue: 0 },
  discount: { type: DataTypes.FLOAT, defaultValue: 0 },
  grandTotal: { type: DataTypes.FLOAT, allowNull: false },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'partially_paid', 'refunded'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'upi', 'online'),
    defaultValue: 'cash'
  },
  paymentDate: DataTypes.DATE,
  notes: DataTypes.TEXT
});

module.exports = Bill;
