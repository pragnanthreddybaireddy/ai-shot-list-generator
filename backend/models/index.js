const { Sequelize, DataTypes } = require('sequelize');
const logger = require('../utils/logger');

const dbUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/shotlist';
const isPostgres = dbUrl.startsWith('postgres');

const sequelize = new Sequelize(dbUrl, {
  dialect: isPostgres ? 'postgres' : 'mysql',
  logging: false, // msg => logger.debug(msg)
  dialectOptions: process.env.NODE_ENV === 'production' && isPostgres ? {
    ssl: { require: true, rejectUnauthorized: false }
  } : {}
});

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Generation = sequelize.define('Generation', {
  id: { type: DataTypes.STRING, primaryKey: true },
  inputs: { type: DataTypes.JSON, allowNull: false },
  result: { type: DataTypes.JSON, allowNull: false },
  model: { type: DataTypes.STRING, allowNull: false }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Feedback = sequelize.define('Feedback', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.INTEGER },
  comment: { type: DataTypes.TEXT }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Template = sequelize.define('Template', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  scene_description: { type: DataTypes.TEXT },
  production_requirements: { type: DataTypes.TEXT },
  camera_angles: { type: DataTypes.TEXT },
  lens_suggestions: { type: DataTypes.TEXT },
  coverage_notes: { type: DataTypes.TEXT },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Relationships
User.hasMany(Generation, { foreignKey: 'user_id' });
Generation.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Feedback, { foreignKey: 'user_id' });
Feedback.belongsTo(User, { foreignKey: 'user_id' });

Generation.hasMany(Feedback, { foreignKey: 'generation_id' });
Feedback.belongsTo(Generation, { foreignKey: 'generation_id' });

module.exports = {
  sequelize,
  User,
  Generation,
  Feedback,
  Template
};
