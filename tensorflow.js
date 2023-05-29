const { Storage } = require('@google-cloud/storage');
const tf = require('@tensorflow/tfjs-node');

const storage = new Storage();

// Fungsi untuk memuat model H5 dari Google Cloud Storage
const loadModelFromBucket = async (bucketName, filename) => {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(`modeldata/` + filename);
  const localFilename = `${filename}`;

  await file.download({ destination: localFilename });

  return tf.loadLayersModel(`file://${localFilename}`);
};

// Fungsi untuk melakukan prediksi menggunakan model pada file yang diunggah
const performPrediction = async (model, file) => {
  try {
    // Mengolah gambar
    const image = await processImage(file);

    // Mengubah gambar menjadi tensor
    const tensor = tf.node.decodeImage(image);

    // Mengubah bentuk tensor sesuai dengan input model
    const reshapedTensor = tensor.reshape([1, ...desiredInputShape]);

    // Melakukan prediksi menggunakan model
    const prediction = model.predict(reshapedTensor);

    // Mengambil hasil prediksi
    const result = await prediction.data();

    // Mengolah hasil prediksi menjadi string
    const processedResult = processPrediction(result);

    return processedResult;
  } catch (error) {
    console.error('Error performing prediction:', error);
    throw error;
  }
};

// Fungsi untuk mengolah hasil prediksi menjadi string
const processPrediction = (prediction) => {
  // Lakukan operasi pengolahan hasil prediksi
  // Sesuaikan dengan struktur dan format hasil yang diinginkan
  const resultString = prediction.toString();
  return resultString;
};

module.exports = {
  loadModelFromBucket,
  performPrediction,
};
