// Exportando variáveis do .env
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT || 7777,
  EMAIL_USER: process.env.EMAIL_USER?.trim(),
  BREVO_API_KEY: process.env.BREVO_API_KEY?.trim(),
  EMAILVERIFY_API_KEY: process.env.EMAILVERIFY_API_KEY?.trim(),
};
