const jwt = require('jsonwebtoken');
const config = require('../config/env');

const getUser = (token) => {
  if (!token) return null;
  
  try {
    const parsedToken = token.replace('Bearer ', '');
    return jwt.verify(parsedToken, config.jwtSecret);
  } catch (err) {
    return null;
  }
};

module.exports = { getUser };