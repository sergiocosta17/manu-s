require('dotenv').config();

const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'secret'
};

if (!config.mongoUri) {
  process.exit(1);
}

module.exports = config;