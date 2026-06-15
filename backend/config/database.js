const { sequelize } = require('../models');
const logger = require('../utils/logger');

async function initDb() {
  try {
    await sequelize.authenticate();
    logger.info(`✅ Connected to SQL Database (${sequelize.options.dialect})`);
    
    // Auto-create/update tables
    await sequelize.sync({ alter: true });
    logger.info('✅ Database tables synced');
  } catch (error) {
    logger.error('❌ SQL Connection Error:', error);
    // Don't crash immediately if the URL is bad locally, just log it.
    // In production we would probably process.exit(1).
  }
}

function getDb() {
  throw new Error("getDb() is deprecated. Use Sequelize models instead.");
}

module.exports = { initDb, getDb };
