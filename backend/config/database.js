const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function initDb() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shotlist';
    await mongoose.connect(mongoUri);
    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    logger.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
}

function getDb() {
  throw new Error("getDb() is deprecated. Use Mongoose models instead.");
}

module.exports = { initDb, getDb };
