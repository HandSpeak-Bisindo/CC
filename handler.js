const { User } = require('./model');
const { generateToken } = require('./auth');
const fs = require('fs');
const bcrypt = require('bcrypt');


const { loadModelFromBucket, performPrediction } = require('./tensorflow');
const { Console } = require('console');

const { Storage } = require('@google-cloud/storage');


const loginHandler = async (request, h) => {
  try {
    const { email, password } = request.payload;

    // Mencari pengguna berdasarkan username
    const user = await User.findOne({ where: { email } });


    // Jika pengguna tidak ditemukan
    if (!user) {
      return h.response('Akun Tidak Ditemukan').code(401);
    }

    // Memeriksa kecocokan password
    bcrypt.compare(password, user.dataValues.password, function (err, result) {
      if (!result) {
        return h.response({
          message: 'Maaf Password yang Ada Masukan Salah'
        }).code(401);
      }
    });


    // Menghasilkan token JWT
    const token = generateToken(user.dataValues);

    return { token };
  } catch (error) {
    console.error('Error:', error);
    return h.response('Internal server error').code(500);
  }
};

const registerHandler = async (request, h) => {
  try {
    const { fullname, password, email } = request.payload;

    // Mencari pengguna berdasarkan username
    const existingUser = await User.findOne({ where: { email } });

    // Jika pengguna dengan username yang sama sudah ada
    if (existingUser) {
      return h.response('Email already exists').code(409);
    }

    //encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat pengguna baru
    await User.create({
      fullname: fullname,
      password: hashedPassword,
      email: email,
    });


    return { message: "Registrasi Berhasil" };
  } catch (error) {
    console.error('Error:', error);
    return h.response('Internal server error').code(500);
  }
};

const profileHandler = async (request, h) => {
  try {
    const { id } = request.auth.credentials;

    // Mencari pengguna berdasarkan ID
    const user = await User.findByPk(id);

    // Jika pengguna tidak ditemukan
    if (!user) {
      return h.response('User not found').code(404);
    }

    return {
      id: user.dataValues.id,
      fullname: user.dataValues.fullname,
      email: user.dataValues.email
    };
  } catch (error) {
    console.error('Error:', error);
    return h.response('Internal server error').code(500);
  }
};


const storage = new Storage();

const uploadFileToBucket = async (file, bucketName, destination) => {
  const bucket = storage.bucket(bucketName);

  const uploadOptions = {
    destination: destination,
    gzip: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  };

  await bucket.upload(file.path, uploadOptions);

  return `https://storage.googleapis.com/${bucketName}/${destination}`;
};

const uploadFileHandler = async (request, h) => {
  try {
    const file = request.payload.img;


    // Pastikan file yang diunggah adalah gambar atau video
    // if (!file.hapi.headers['content-type'].includes('image') && !file.hapi.headers['content-type'].includes('video')) {
    //   return h.response('File harus berupa gambar atau video').code(400);
    // }

    const bucketName = 'handspeak';
    const destination = `upload/${file.filename}`;


    const fileUrl = await uploadFileToBucket(file, bucketName, destination);
    console.log( fileUrl);

    const modelBucketName = 'handspeak';
    const modelFilename = 'model_data.h5';
    const model = await loadModelFromBucket(modelBucketName, modelFilename);

    const result = await performPrediction(model, file);

    return { fileUrl, result };
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    return h.response('Internal server error').code(500);
  }
};


const editProfileHandler = async (request, h) => {
  try {
    const { id } = request.auth.credentials;
    const { fullname, email } = request.payload;

    // Mencari pengguna berdasarkan ID
    const user = await User.findByPk(id);

    // Jika pengguna tidak ditemukan
    if (!user) {
      return h.response('User not found').code(404);
    }

    // Melakukan pembaruan data profil
    await user.update({
      fullname: fullname,
      email: email,
    });


    return {
      message: 'Profile updated successfully',
      user: {
        id: user.dataValues.id,
        fullname: user.dataValues.fullname,
        email: user.dataValues.email
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return h.response('Internal server error').code(500);
  }
};


async function uploadFileAndPredictHandler(request, h) {
  try {
    const { file } = request.payload;

    // Memuat model H5 dari bucket Cloud Storage
    const model = await loadModelFromBucket();

    // Melakukan prediksi menggunakan model pada file yang diunggah
    const result = await performPrediction(model, file);

    return { result };
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    throw error;
  }
};


module.exports = {
  loginHandler,
  registerHandler,
  profileHandler,
  uploadFileAndPredictHandler,
  editProfileHandler,
  uploadFileHandler
};
