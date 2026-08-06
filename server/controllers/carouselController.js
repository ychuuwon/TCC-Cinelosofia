const CarouselImage = require('../models/carouselImage');
const { uploadToCloudinary } = require('../utils/cloudinary');

const listar = async (req, res) => {
  try {
    const { slot } = req.query;
    const filtro = slot ? { slot } : {};
    const items = await CarouselImage.find(filtro).sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    console.error('carousel listar error:', error);
    return res.status(500).json({ erro: 'Erro ao listar imagens do carrossel.' });
  }
};

const criar = async (req, res) => {
  try {
    const { slot } = req.body;
    const allowed = ['home', 'login', 'register', 'auth'];
    if (!slot || !allowed.includes(slot)) {
      return res.status(400).json({ erro: 'Slot inválido.' });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'Arquivo de imagem é obrigatório.' });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    const item = await CarouselImage.create({
      slot,
      url: result.secure_url,
      public_id: result.public_id,
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error('carousel criar error:', error);
    return res.status(500).json({ erro: 'Erro ao criar imagem do carrossel.' });
  }
};

const deletar = async (req, res) => {
  try {
    const item = await CarouselImage.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Imagem não encontrada.' });
    return res.status(200).json({ mensagem: 'Imagem removida com sucesso.' });
  } catch (error) {
    console.error('carousel deletar error:', error);
    return res.status(500).json({ erro: 'Erro ao remover imagem do carrossel.' });
  }
};

module.exports = { listar, criar, deletar };
