// models/userModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // assure-toi que ce chemin est correct

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;

