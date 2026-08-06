const Encontro = require('../models/encontro');
const Usuario = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');

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
    const encontroAtual = await Encontro.findOne({ destaque: true }).sort({ createdAt: -1 });

    if (encontroAtual) {
      return res.status(200).json(encontroAtual);
    }

    const encontroMaisRecente = await Encontro.findOne().sort({ createdAt: -1 });
    return res.status(200).json(encontroMaisRecente || {});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar o próximo encontro.' });
  }
};

const buscarAtivo = async (req, res) => {
  try {
    const encontroAtual = await Encontro.findOne({ destaque: true }).sort({ createdAt: -1 });

    if (encontroAtual) {
      return res.status(200).json(encontroAtual);
    }

    const encontroMaisRecente = await Encontro.findOne().sort({ createdAt: -1 });
    return res.status(200).json(encontroMaisRecente || {});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar o encontro ativo.' });
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
    const { tema, sinopse, direcao, ano, genero, foto_capa, data, hora, local, duracao, obs, trailer } = req.body;

    if (!tema || !data || !hora || !local) {
      return res.status(400).json({ erro: 'Tema, data, hora e local são obrigatórios.' });
    }

    let fotoCapaUrl = foto_capa;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      fotoCapaUrl = result.secure_url;
    }

    await Encontro.updateMany({ destaque: true }, { $set: { destaque: false, presencas: [] } });

    const novoEncontro = await Encontro.create({
      tema,
      sinopse,
      direcao,
      ano,
      genero,
      foto_capa: fotoCapaUrl,
      data,
      hora,
      local,
      duracao,
      obs,
      destaque: true,
      trailer,
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
    const { tema, sinopse, direcao, ano, genero, foto_capa, data, hora, local, duracao, obs, trailer } = req.body;

    let fotoCapaUrl = foto_capa;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      fotoCapaUrl = result.secure_url;
    }

    const encontroAntes = await Encontro.findById(req.params.id);
    if (!encontroAntes) {
      return res.status(404).json({ erro: 'Encontro não encontrado.' });
    }

    await Encontro.updateMany({ _id: { $ne: req.params.id } }, { $set: { destaque: false } });

    const updateFields = {
      tema,
      sinopse,
      direcao,
      ano,
      genero,
      foto_capa: fotoCapaUrl,
      data,
      hora,
      local,
      duracao,
      obs,
      trailer,
      destaque: true,
    };

    if (!encontroAntes.destaque) {
      updateFields.presencas = [];
    }

    const encontro = await Encontro.findByIdAndUpdate(req.params.id, updateFields, { new: true });

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

const salvarAtivo = async (req, res) => {
  try {
    const { tema, sinopse, direcao, ano, genero, foto_capa, data, hora, local, duracao, obs, trailer } = req.body;

    if (!tema || !data || !hora || !local) {
      return res.status(400).json({ erro: 'Tema, data, hora e local são obrigatórios.' });
    }

    let fotoCapaUrl = foto_capa;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      fotoCapaUrl = result.secure_url;
    }

    const encontroAtual = await Encontro.findOne({ destaque: true }).sort({ createdAt: -1 });
    await Encontro.updateMany({ destaque: true }, { $set: { destaque: false, presencas: [] } });

    if (encontroAtual) {
      const encontroAtualizado = await Encontro.findByIdAndUpdate(
        encontroAtual._id,
        { tema, sinopse, direcao, ano, genero, foto_capa: fotoCapaUrl, data, hora, local, duracao, obs, trailer, destaque: true, presencas: [] },
        { new: true }
      );

      return res.status(200).json({
        mensagem: 'Encontro ativo atualizado com sucesso!',
        encontro: encontroAtualizado,
      });
    }

    const novoEncontro = await Encontro.create({
      tema,
      sinopse,
      direcao,
      ano,
      genero,
      foto_capa: fotoCapaUrl,
      data,
      hora,
      local,
      duracao,
      obs,
      trailer,
      destaque: true,
      presencas: [],
    });

    return res.status(201).json({
      mensagem: 'Encontro ativo criado com sucesso!',
      encontro: novoEncontro,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao salvar encontro ativo.' });
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
    const encontroId = req.params.id;
    const { turma, nome } = req.body;

    if (!turma) {
      return res.status(400).json({ erro: 'Turma é obrigatória.' });
    }

    if (!req.userId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const usuario = await Usuario.findById(req.userId);
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' });
    }

    const encontro = await Encontro.findById(encontroId);
    if (!encontro) {
      return res.status(404).json({ erro: 'Encontro não encontrado.' });
    }

    const jaRegistrado = encontro.presencas.some((item) => item.usuario?.toString() === usuario._id.toString());
    if (jaRegistrado) {
      return res.status(400).json({ erro: 'Você já confirmou presença neste encontro.' });
    }

    const nomeSalvo = nome && String(nome).trim() !== '' ? String(nome).trim() : usuario.nome_usuario;

    encontro.presencas.push({
      usuario: usuario._id,
      nome: nomeSalvo,
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
  buscarAtivo,
  buscarPorId,
  criarEncontro,
  atualizarEncontro,
  salvarAtivo,
  deletarEncontro,
  registrarPresenca,
  listarPresencas,
};