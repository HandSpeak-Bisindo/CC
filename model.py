import tensorflow as tf
from tensorflow import keras

# def load_model():
#     model = tf.keras.models.load_model('model.h5')
#     return model

# loaded_model = load_model()
# loaded_model.save('models')
model_path = 'model.h5'
model = keras.models.load_model(model_path)

export_path = 'modes'
tf.saved_model.save(model, export_path)
