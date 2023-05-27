// const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./database');
const uuid = require('uuid');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: () => uuid.v4()
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // photo: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
}, {
  timestamps: false
});

module.exports = {
  User,
};
