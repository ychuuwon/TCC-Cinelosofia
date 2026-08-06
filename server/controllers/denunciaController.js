const Denuncia = require('../models/denuncia');

const listarDenuncias = async (req, res) => {
  try {
    const denuncias = await Denuncia.find().sort({ createdAt: -1 });
    return res.status(200).json(denuncias);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar denúncias.' });
  }
};

const criarDenuncia = async (req, res) => {
  try {
    const { autor, mensagem, motivo } = req.body;

    if (!mensagem || String(mensagem).trim() === '') {
      return res.status(400).json({ erro: 'Mensagem da denúncia é obrigatória.' });
    }

    const nova = await Denuncia.create({ autor, mensagem: String(mensagem).trim(), motivo });
    return res.status(201).json(nova);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar denúncia.' });
  }
};

const deletarDenuncia = async (req, res) => {
  try {
    const denuncia = await Denuncia.findByIdAndDelete(req.params.id);
    if (!denuncia) {
      return res.status(404).json({ erro: 'Denúncia não encontrada.' });
    }
    return res.status(200).json({ mensagem: 'Denúncia removida com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao remover denúncia.' });
  }
};

const atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pendente', 'Revisada'].includes(status)) {
      return res.status(400).json({ erro: 'Status inválido.' });
    }
    const denuncia = await Denuncia.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!denuncia) return res.status(404).json({ erro: 'Denúncia não encontrada.' });
    return res.status(200).json(denuncia);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar denúncia.' });
  }
};

module.exports = {
  listarDenuncias,
  criarDenuncia,
  deletarDenuncia,
  atualizarStatus,
};
