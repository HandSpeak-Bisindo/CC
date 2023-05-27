const { User } = require('./model');
const { generateToken } = require('./auth');
// const { uploadPhoto } = require('./upload');
// const sharp = require('sharp');
const fs = require('fs');
const bcrypt = require('bcrypt');

const { loadModelFromBucket, performPrediction } = require('./tensorflow');
const { Console } = require('console');


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

// Handler untuk mengupload foto dan mengembalikan hasil prediksi
// const uploadPhotoHandler = async (request, h) => {
//     try {
//       const file = request.payload.file; // Mengambil file dari payload

//       // Proses pengolahan gambar dan prediksi di sini

//       // Contoh pengolahan gambar menggunakan package 'sharp'
//       const processedImage = await sharp(file.path).resize(500).toBuffer();

//       // Melakukan prediksi pada gambar yang diupload
//       const prediction = await predictImage(processedImage);

//       // Menghapus file sementara
//       fs.unlinkSync(file.path);

//       // Mengembalikan hasil prediksi sebagai respons
//       return prediction;
//     } catch (error) {
//       console.error('Error:', error);
//       throw error;
//     }
//   };

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
};
