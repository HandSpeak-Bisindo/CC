const { loginHandler, registerHandler, profileHandler, uploadFileHandler, editProfileHandler } = require('./handler');

const routes = [
  {
    method: 'POST',
    path: '/login',
    handler: loginHandler, // Handler untuk rute login
  },
  {
    method: 'POST',
    path: '/register',
    handler: registerHandler, // Handler untuk rute registrasi
  },
  {
    method: 'GET',
    path: '/profile',
    handler: profileHandler, // Handler untuk rute profil
    options: {
      auth: 'jwt', // Menggunakan autentikasi JWT
    },
  },

  {
    method: 'POST',
    path: '/upload',
    handler: uploadFileHandler, // Handler untuk rute upload file
    options: {
      auth: 'jwt', // Menggunakan autentikasi JWT
      payload: {
        output: 'file',
        allow: 'multipart/form-data',
        multipart: true,
        parse: true,
      },
    },
  },

  {
    method: 'PUT',
    path: '/edit',
    handler: editProfileHandler,
    options: {
      auth: 'jwt',
    }
  }
];

module.exports = routes;
