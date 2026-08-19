const { MONGO_URI } = require('./config');
const mongoose = require('mongoose');

const migrarColecaoAcervos = async () => {
  const banco = mongoose.connection.db;
  const colecoes = await banco.listCollections({}, { nameOnly: true }).toArray();
  const existeColecaoAntiga = colecoes.some((colecao) => colecao.name === 'acervos');
  const existeColecaoNova = colecoes.some((colecao) => colecao.name === 'acervo_curtas');

  if (existeColecaoAntiga && !existeColecaoNova) {
    await banco.collection('acervos').rename('acervo_curtas');
    console.log('Coleção acervos renomeada para acervo_curtas');
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await migrarColecaoAcervos();
    console.log('MongoDB conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar no MongoDB:', error.message);
    process.exit(1);
  }
};
module.exports = connectDB;
