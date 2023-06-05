const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('handspeak_db', 'root', 'jimmi123456', {
  host: '34.101.65.33',
  dialect: 'mysql',
});

module.exports = sequelize;
