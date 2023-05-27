const { request } = require('express');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const token = jwt.sign({ id: user.id }, 'secret-key', { expiresIn: '1h' });
  return token;
};

const validateToken = async (decoded, request, h) => {
  return { isValid: true };
}

module.exports = {
  generateToken,
  validateToken,
};
