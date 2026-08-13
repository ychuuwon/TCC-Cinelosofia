const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFavicon = async (imagePath) => {
  try {
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Erro: Arquivo não encontrado em: ${imagePath}`);
      process.exit(1);
    }

    console.log(`📤 Fazendo upload do favicon para Cloudinary...`);

    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'cinelosofia',
      public_id: 'favicon',
      resource_type: 'auto',
      overwrite: true,
    });

    console.log(`✅ Favicon enviado com sucesso!`);
    console.log(`🔗 URL do Cloudinary: ${result.secure_url}`);
    console.log(`\n📝 Atualize o arquivo client/public/index.html com:`);
    console.log(`<link rel="icon" href="${result.secure_url}" />`);

    return result.secure_url;
  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error.message);
    process.exit(1);
  }
};

// Verificar argumento da linha de comando
const imagePath = process.argv[2];

if (!imagePath) {
  console.log('💡 Uso: node upload_favicon.js <caminho_da_imagem>');
  console.log('   Exemplo: node upload_favicon.js ./favicon.png');
  process.exit(1);
}

uploadFavicon(imagePath);
