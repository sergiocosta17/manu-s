require('dotenv').config();

const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  adminAccessKey: process.env.ADMIN_ACCESS_KEY || 'manus123'
};

if (!config.mongoUri) {
  process.exit(1);
}

module.exports = config;