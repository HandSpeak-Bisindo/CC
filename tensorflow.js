const { Storage } = require('@google-cloud/storage');
const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
console.log('Versi TensorFlow Node:', tf.version.tfjs);
const Jimp = require('jimp');




// const storage = new Storage();

async function preprocess_image(imageBuffer) {
  const resizedImageBuffer = await sharp(imageBuffer).resize(150, 150).toBuffer();

  const image = await Jimp.read(resizedImageBuffer);
  const imageArray = Array.from(image.bitmap.data);
  const imageTypedArray = new Uint8Array(imageArray);

  const imageTensor = tf.tensor3d(imageTypedArray, [image.bitmap.height, image.bitmap.width, 4]);

  // Periksa jika dimensi gambar adalah [height, width, channels] dan jumlah saluran warna adalah 3 atau 1
  if (imageTensor.shape[2] === 4) {
    const reshapedImage = imageTensor.slice([0, 0, 0], [150, 150, 3]);
    const finalReshapedImage = reshapedImage.div(255);
    return finalReshapedImage;
  } else if (imageTensor.shape[2] === 1) {
    const finalReshapedImage = imageTensor.div(255);
    return finalReshapedImage;
  } else {
    throw new Error('Format gambar tidak valid.');
  }
}




// Fungsi untuk mengolah hasil prediksi menjadi string
const processPrediction = (prediction) => {
  // Daftar huruf bahasa isyarat
  const signLanguageLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // Mengambil indeks kelas dengan nilai prediksi tertinggi
  const maxIndex = prediction.indexOf(Math.max(...prediction));

  // Mengambil huruf bahasa isyarat berdasarkan indeks
  const predictedLetter = signLanguageLetters[maxIndex] || 'Unknown';

  // Mengembalikan string huruf bahasa isyarat hasil prediksi
  return predictedLetter;
};

// Fungsi untuk melakukan prediksi menggunakan model pada file yang diunggah
const performPrediction = async (model, file) => {
  try {
    // Mengolah gambar
    const image = await preprocess_image(file);

    // Menambahkan dimensi batch pada input
    const batchedInput = image.expandDims(0);

    // Melakukan prediksi menggunakan model
    const prediction = await model.predict(batchedInput);

    // Mengambil hasil prediksi
    const result = await prediction.data();

    // Mengolah hasil prediksi menjadi string huruf bahasa isyarat
    const predictedLetter = processPrediction(result);

    return predictedLetter;
  } catch (error) {
    console.error('Error performing prediction:', error);
    throw error;
  }
};


module.exports = { performPrediction};
