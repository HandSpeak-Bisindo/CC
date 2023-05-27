const { Storage } = require('@google-cloud/storage');
const tf = require('@tensorflow/tfjs-node');

const storage = new Storage();
const bucketName = 'nama-bucket';
const modelFileName = 'nama-file-model.h5';

// Fungsi untuk memuat model H5 dari bucket Cloud Storage
async function loadModelFromBucket() {
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(modelFileName);

    // Memuat model H5 dari bucket menggunakan TensorFlow.js
    const modelBuffer = await file.download();
    const model = await tf.loadLayersModel(tf.node.buffer(modelBuffer[0]));

    console.log('Model H5 berhasil dimuat dari bucket Cloud Storage');

    return model;
  } catch (error) {
    console.error('Terjadi kesalahan saat memuat model H5:', error);
    throw error;
  }
}

// Fungsi untuk melakukan prediksi menggunakan model yang telah dimuat
async function performPrediction(model, data) {
  try {
    // Lakukan prediksi pada data
    const prediction = model.predict(data);

    // Ambil hasil prediksi sebagai tensor
    const tensorResult = await prediction.data();

    // Ubah tensor menjadi array
    const resultArray = Array.from(tensorResult);

    // Ubah array menjadi string
    const resultString = resultArray.join(', ');

    // Kembalikan hasil prediksi sebagai string
    return resultString;
  } catch (error) {
    console.error('Terjadi kesalahan saat melakukan prediksi:', error);
    throw error;
  }
}

module.exports = { loadModelFromBucket, performPrediction };
