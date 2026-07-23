const Genero = require('../models/genero');

const buscarTodos = async (req, res) => {
  try {
    const generos = await Genero.find();
    return res.status(200).json(generos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar gêneros.' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const genero = await Genero.findById(req.params.id);

    if (!genero) {
      return res.status(404).json({ erro: 'Gênero não encontrado.' });
    }

    return res.status(200).json(genero);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar gênero.' });
  }
};

const criarGenero = async (req, res) => {
  try {
    const { descricao } = req.body;

    if (!descricao) {
      return res.status(400).json({ erro: 'Descrição é obrigatória.' });
    }

    const novoGenero = await Genero.create({ descricao });

    return res.status(201).json({
      mensagem: 'Gênero criado com sucesso!',
      genero: novoGenero,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar gênero.' });
  }
};

const atualizarGenero = async (req, res) => {
  try {
    const { descricao } = req.body;

    const genero = await Genero.findByIdAndUpdate(
      req.params.id,
      { descricao },
      { new: true }
    );

    if (!genero) {
      return res.status(404).json({ erro: 'Gênero não encontrado.' });
    }

    return res.status(200).json({
      mensagem: 'Gênero atualizado com sucesso!',
      genero,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar gênero.' });
  }
};

const deletarGenero = async (req, res) => {
  try {
    const genero = await Genero.findByIdAndDelete(req.params.id);

    if (!genero) {
      return res.status(404).json({ erro: 'Gênero não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Gênero deletado com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao deletar gênero.' });
  }
};

module.exports = {
  buscarTodos,
  buscarPorId,
  criarGenero,
  atualizarGenero,
  deletarGenero,
};
