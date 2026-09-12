// Exportando variáveis do .env
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const parseBoolean = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT || 7777,
  EMAIL_USER: process.env.EMAIL_USER?.trim(),
  EMAIL_PASS: process.env.EMAIL_PASS?.replace(/\s/g, ''),
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 465,
  SMTP_SECURE: parseBoolean(process.env.SMTP_SECURE, true),
};
