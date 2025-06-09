// models/userModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // assure-toi que ce chemin est correct

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Utilisateur',
  },
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;

