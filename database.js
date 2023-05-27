const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('SignSpeak', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
