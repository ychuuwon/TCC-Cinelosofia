const Encontro = require('../models/encontro');

const buscarTodos = async (req, res) => {
  try {
    const encontros = await Encontro.find().sort({ data: 1 });
    return res.status(200).json(encontros);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar encontros.' });
  }
};

const buscarProximo = async (req, res) => {
  try {
    const proximoEncontro = await Encontro.findOne({
      data: { $gte: new Date() },
    }).sort({ data: 1 });

    if (!proximoEncontro) {
      const ultimo = await Encontro.findOne().sort({ createdAt: -1 });
      return res.status(200).json(ultimo || {});
    }

    return res.status(200).json(proximoEncontro);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar o próximo encontro.' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const encontro = await Encontro.findById(req.params.id).populate('presencas.usuario', 'nome_usuario matricula');
    if (!encontro) {
      return res.status(404).json({ erro: 'Encontro não encontrado.' });
    }

    return res.status(200).json(encontro);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar detalhes do encontro.' });
  }
};

const criarEncontro = async (req, res) => {
  try {
    const { tema, data, hora, local, duracao, obs } = req.body;

    if (!tema || !data || !hora || !local) {
      return res.status(400).json({ erro: 'Tema, data, hora e local são obrigatórios.' });
    }

    const novoEncontro = await Encontro.create({
      tema,
      data,
      hora,
      local,
      duracao,
      obs,
      presencas: [],
    });

    return res.status(201).json({
      mensagem: 'Encontro criado com sucesso!',
      encontro: novoEncontro,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar encontro.' });
  }
};

const atualizarEncontro = async (req, res) => {
  try {
    const { tema, data, hora, local, duracao, obs } = req.body;

    const encontro = await Encontro.findByIdAndUpdate(
      req.params.id,
      { tema, data, hora, local, duracao, obs },
      { new: true }
    );

    if (!encontro) {
      return res.status(404).json({ erro: 'Encontro não encontrado.' });
    }

    return res.status(200).json({
      mensagem: 'Encontro atualizado com sucesso!',
      encontro,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar encontro.' });
  }
};

const deletarEncontro = async (req, res) => {
  try {
    const encontro = await Encontro.findByIdAndDelete(req.params.id);

    if (!encontro) {
      return res.status(404).json({ erro: 'Encontro não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Encontro deletado com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao deletar encontro.' });
  }
};

const registrarPresenca = async (req, res) => {
  try {
    const { encontroId } = req.params;
    const { nome, turma } = req.body;

    if (!nome || !turma) {
      return res.status(400).json({ erro: 'Nome e turma são obrigatórios.' });
    }

    const encontro = await Encontro.findById(encontroId);
    if (!encontro) {
      return res.status(404).json({ erro: 'Encontro não encontrado.' });
    }

    encontro.presencas.push({
      usuario: req.userId,
      nome,
      turma,
      status: true,
      data_registro: new Date(),
    });

    await encontro.save();
    return res.status(200).json({ mensagem: 'Presença confirmada com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao registrar sua presença.' });
  }
};

const listarPresencas = async (req, res) => {
  try {
    const encontro = await Encontro.findById(req.params.id).populate('presencas.usuario', 'nome_usuario matricula');
    
    if (!encontro) {
      return res.status(404).json({ erro: 'Encontro não encontrado.' });
    }

    return res.status(200).json(encontro.presencas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar presenças.' });
  }
};

module.exports = {
  buscarTodos,
  buscarProximo,
  buscarPorId,
  criarEncontro,
  atualizarEncontro,
  deletarEncontro,
  registrarPresenca,
  listarPresencas,
};