const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dataDir, 'restaurant.sqlite'),
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅  SQLite Connected (Sequelize)');
    
    // We'll sync in server.js after models are loaded
  } catch (err) {
    console.error('❌  SQLite Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
