const { Storage } = require('@google-cloud/storage');
const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
console.log('Versi TensorFlow Node:', tf.version.tfjs);



const storage = new Storage();

// Fungsi untuk memuat model H5 dari Google Cloud Storage
const loadModelFromBucket = async (bucketName, filename) => {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(`modeldata/` + filename);
  const localFilename = `${filename}`;

  await file.download({ destination: localFilename });

  return tf.loadLayersModel(`file://${localFilename}`);
};

async function preprocess_image(imageBuffer) {
  const resizedImageBuffer = await sharp(imageBuffer).resize(150, 150).toBuffer();


    const imageArray = Array.from(resizedImageBuffer);
    const imageTypedArray = new Uint8Array(imageArray);


    const imageTensor = tf.tensor(imageTypedArray);
  
    const reshapedImage = imageTensor.reshape([150, 150, 3]).expandDims(0);
    const finalReshapedImage = reshapedImage.div(1/255);

  return finalReshapedImage;
}

// Fungsi untuk memproses gambar sebelum dilakukan prediksi
const processImage = async (file) => {
  try {
    const imageBuffer = file;
    // const resizedImage = tf.node.decodeImage(imageBuffer);
    // const resizedImageTensor = tf.image.resizeBilinear(resizedImage, [150, 150]);
    
    // // Normalisasi gambar (opsional)
    // const normalizedImageTensor = resizedImageTensor.div(tf.scalar(255));
    
    // // Mengubah tensor gambar menjadi tensor batch dengan dimensi [1, height, width, channels]
    // const batchedImageTensor = normalizedImageTensor.expandDims(0);
    // console.log(batchedImageTensor);

    // Mengubah tensor menjadi array JavaScript
    // const processedImage = batchedImageTensor.arraySync();
    const processedImage = await sharp(imageBuffer).resize(150, 150).normalise().toBuffer();

    // Mengembalikan gambar yang telah diproses
    return processedImage;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

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

    // Mengubah array gambar menjadi tensor

    // Melakukan prediksi menggunakan model
    const prediction = await model.predict(image);

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

module.exports = {loadModelFromBucket, performPrediction};
