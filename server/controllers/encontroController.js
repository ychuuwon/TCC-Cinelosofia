const Encontro = require('../models/encontro');

const buscarProximo = async (req, res) => {
  try {
    const proximoEncontro = await Encontro.findOne({
      data: { $gte: new Date() },
    }).sort({ data: 1 });

    if (!proximoEncontro) {
      const ultimo = await Encontro.findOne().sort({ createdAt: -1 });
      return res.status(200).json(ultimo);
    }

    return res.status(200).json(proximoEncontro);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao carregar o próximo encontro.' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const encontro = await Encontro.findById(req.params.id);
    if (!encontro) {
      return res.status(404).json({ erro: 'Encontro não encontrado.' });
    }

    return res.status(200).json(encontro);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao carregar detalhes do encontro.' });
  }
};

const registrarPresenca = async (req, res) => {
  try {
    const { encontroId } = req.params;
    const { usuarioId } = req.body;

    const encontro = await Encontro.findById(encontroId);
    if (!encontro) {
      return res.status(404).json({ erro: 'Encontro não encontrado.' });
    }

    const jaPresente = encontro.presencas.some((p) => p.usuario.toString() === usuarioId);
    if (jaPresente) {
      return res.status(400).json({ erro: 'Sua presença já está confirmada neste encontro.' });
    }

    encontro.presencas.push({
      usuario: usuarioId,
      status: true,
      data_registro: new Date(),
    });

    await encontro.save();
    return res.status(200).json({ mensagem: 'Presença confirmada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao registrar sua presença.' });
  }
};

module.exports = {
  buscarProximo,
  buscarPorId,
  registrarPresenca,
};