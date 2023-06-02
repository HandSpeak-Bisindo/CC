const { User } = require('./model');
const { generateToken } = require('./auth');
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');

const bcrypt = require('bcrypt');


const { performPrediction } = require('./tensorflow');

const { Storage } = require('@google-cloud/storage');

const { spawnSync } = require('child_process');
const path = require('path');


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
  const files = bucket.file(destination);
  
  // Unduh file dari Cloud Storage
  const [fileData] = await files.download();

  // FileData adalah buffer gambar
  return fileData;
};

const uploadFileHandler = async (request, h) => {
  try {
    const file = request.payload.img;
    const bucketName = 'handspeak';
    const destination = `upload/${file.filename}`;


    const fileUrl = await uploadFileToBucket(file, bucketName, destination);
    
    const model = await tf.loadLayersModel('file://saved_model/model.json');

    const result = await performPrediction(model, fileUrl);
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



module.exports = {
  loginHandler,
  registerHandler,
  profileHandler,
  // uploadFileAndPredictHandler,
  editProfileHandler,
  uploadFileHandler
};
