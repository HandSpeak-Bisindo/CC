const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('SignSpeak', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;

// ganti 'database-name', 'username', dan 'password' pada baris ke-3 sesuai dengan konfigurasi database MySQL Anda.