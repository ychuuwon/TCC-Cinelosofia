const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const parseCloudinaryUrl = (url) => {
  if (!url) {
    return null;
  }

  const match = url.match(/^cloudinary:\/\/(\d+):([^@]+)@(.+)$/i);
  if (!match) {
    return null;
  }

  return {
    api_key: match[1],
    api_secret: match[2],
    cloud_name: match[3],
    secure: true,
  };
};

const getCloudinaryConfig = () => {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  if (fromUrl) {
    return fromUrl;
  }

  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  };
};

const cloudinaryConfig = getCloudinaryConfig();
cloudinary.config(cloudinaryConfig);

const verifyCloudinaryConnection = () => {
  if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
    console.warn('Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET (ou CLOUDINARY_URL).');
    return;
  }

  cloudinary.api.ping((error) => {
    if (error) {
      console.warn('Cloudinary indisponível:', error.message || error.error?.message || error);
      return;
    }

    console.log('Cloudinary conectado com sucesso.');
  });
};

verifyCloudinaryConnection();

const uploadToCloudinary = (fileBuffer, originalName) => {
  if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
    throw new Error('Configuração do Cloudinary incompleta. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET (ou CLOUDINARY_URL).');
  }

  return new Promise((resolve, reject) => {
    const publicId = originalName
      ? originalName.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-').toLowerCase()
      : undefined;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'cinelosofia',
        resource_type: 'image',
        public_id: publicId,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(new Error(error.message || 'Erro ao enviar imagem para o Cloudinary.'));
          return;
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};
