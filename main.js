const Hapi = require('@hapi/hapi');
const routes = require('./routers');
const sequelize = require('./database');
const hapiAuthJwt2 = require('hapi-auth-jwt2');
const { validateToken } = require('./auth');

const init = async () => {


  const server = Hapi.server({
    port: 3000,
    host: 'localhost',

  });

  await server.register(hapiAuthJwt2)

  server.auth.strategy('jwt', 'jwt', {
    key: 'secret-key',
    validate:validateToken,
    verifyOptions: { algorithms: ['HS256'] }
  });

  // server.auth.default('jwt');

  try {
    // Menghubungkan ke database
    await sequelize.authenticate();
    console.log('Connected to the database.');

    // Menginisialisasi tabel di database (jika belum ada)
    await sequelize.sync();
    console.log('Database synchronized.');

    // Menambahkan routes ke server
    server.route(routes);

    // Menjalankan server
    await server.start();
    console.log('Server running on', server.info.uri);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

init();
