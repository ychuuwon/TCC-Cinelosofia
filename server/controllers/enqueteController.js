const Enquete = require('../models/enquete');
const Usuario = require('../models/User');
const Encontro = require('../models/encontro');

const buscarTodos = async (req, res) => {
  try {
    const enquetes = await Enquete.find().sort({ createdAt: -1 });
    return res.status(200).json(enquetes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar enquetes.' });
  }
};

const buscarAtivo = async (req, res) => {
  try {
    const encontroAtivo = await Encontro.findOne({ destaque: true }).sort({ createdAt: -1 });
    const enqueteAtual = await Enquete.findOne({ destaque: true }).sort({ createdAt: -1 });

    if (enqueteAtual) {
      return res.status(200).json(enqueteAtual);
    }

    if (encontroAtivo) {
      return res.status(200).json({});
    }

    const enqueteAberta = await Enquete.findOne({ isOpen: true }).sort({ createdAt: -1 });
    if (enqueteAberta) {
      return res.status(200).json(enqueteAberta);
    }

    const ultimaEnquete = await Enquete.findOne().sort({ createdAt: -1 });
    return res.status(200).json(ultimaEnquete || {});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar enquete ativa.' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const enquete = await Enquete.findById(req.params.id).populate('votes.usuario', 'nome_usuario matricula');
    if (!enquete) return res.status(404).json({ erro: 'Enquete não encontrada.' });
    return res.status(200).json(enquete);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar enquete.' });
  }
};

const criarEnquete = async (req, res) => {
  try {
    const { titulo, options } = req.body;
    if (!titulo || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ erro: 'Título e ao menos uma opção são obrigatórios.' });
    }

    await Encontro.updateMany({ destaque: true }, { $set: { destaque: false, presencas: [] } });
    await Enquete.updateMany({ destaque: true }, { $set: { destaque: false } });

    const nova = await Enquete.create({ titulo, options, isOpen: false, destaque: true, votes: [] });

    return res.status(201).json({ mensagem: 'Enquete criada.', enquete: nova });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar enquete.' });
  }
};

const abrirFechar = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOpen } = req.body;
    const enquete = await Enquete.findById(id);
    if (!enquete) return res.status(404).json({ erro: 'Enquete não encontrada.' });

    enquete.isOpen = Boolean(isOpen);
    enquete.destaque = true;
    await Encontro.updateMany({ destaque: true }, { $set: { destaque: false, presencas: [] } });
    await Enquete.updateMany({ _id: { $ne: id } }, { $set: { destaque: false } });
    await enquete.save();

    return res.status(200).json({ mensagem: `Enquete ${enquete.isOpen ? 'aberta' : 'fechada'}.`, enquete });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar enquete.' });
  }
};

const votar = async (req, res) => {
  try {
    const enqueteId = req.params.id;
    const { optionIndex } = req.body;

    if (!req.userId) return res.status(401).json({ erro: 'Usuário não autenticado.' });

    const usuario = await Usuario.findById(req.userId);
    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado.' });

    const enquete = await Enquete.findById(enqueteId);
    if (!enquete) return res.status(404).json({ erro: 'Enquete não encontrada.' });

    if (!enquete.isOpen) return res.status(400).json({ erro: 'Enquete não está aberta para votos.' });

    const jaVotou = enquete.votes.some((v) => v.usuario?.toString() === usuario._id.toString());
    if (jaVotou) return res.status(400).json({ erro: 'Você já votou nesta enquete.' });

    const idx = Number(optionIndex);
    if (Number.isNaN(idx) || idx < 0 || idx >= (enquete.options?.length || 0)) {
      return res.status(400).json({ erro: 'Opção inválida.' });
    }

    enquete.votes.push({ usuario: usuario._id, optionIndex: idx, data: new Date() });
    await enquete.save();

    return res.status(200).json({ mensagem: 'Voto registrado com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao registrar voto.' });
  }
};

const removerVoto = async (req, res) => {
  try {
    const enqueteId = req.params.id;

    if (!req.userId) return res.status(401).json({ erro: 'Usuário não autenticado.' });

    const usuario = await Usuario.findById(req.userId);
    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado.' });

    const enquete = await Enquete.findById(enqueteId);
    if (!enquete) return res.status(404).json({ erro: 'Enquete não encontrada.' });

    // remove votes by this user
    const before = enquete.votes.length;
    enquete.votes = enquete.votes.filter((v) => String(v.usuario) !== String(usuario._id));
    const after = enquete.votes.length;

    if (before === after) return res.status(400).json({ erro: 'Você ainda não votou nesta enquete.' });

    await enquete.save();
    return res.status(200).json({ mensagem: 'Voto removido.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao remover voto.' });
  }
};

const deletar = async (req, res) => {
  try {
    const enquete = await Enquete.findByIdAndDelete(req.params.id);
    if (!enquete) return res.status(404).json({ erro: 'Enquete não encontrada.' });
    return res.status(200).json({ mensagem: 'Enquete removida.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao remover enquete.' });
  }
};

module.exports = {
  buscarTodos,
  buscarAtivo,
  buscarPorId,
  criarEnquete,
  abrirFechar,
  votar,
  removerVoto,
  deletar,
};
