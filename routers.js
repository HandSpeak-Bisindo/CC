const { loginHandler, registerHandler, profileHandler, uploadPhotoHandler,editProfileHandler } = require('./handler');

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
  // {
  //   method: 'POST',
  //   path: '/upload',
  //   handler: uploadPhotoHandler, // Handler untuk rute upload foto
  //   options: {
  //     auth: 'jwt', // Menggunakan autentikasi JWT
  //     payload: {
  //       output: 'stream',
  //       allow: 'multipart/form-data',
  //       maxBytes: 2 * 1024 * 1024, // Batasan ukuran file upload (2MB)
  //       parse: true,
  //     },
  //   },
  // },

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
