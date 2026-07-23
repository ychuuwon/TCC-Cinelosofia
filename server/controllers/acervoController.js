const Acervo = require('../models/acervo');

const buscarTodos = async (req, res) => {
  try {
    const { tipo } = req.query;
    let filtro = {};

    if (tipo && (tipo === 'cine' || tipo === 'curta')) {
      filtro.tipo = tipo;
    }

    const acervos = await Acervo.find(filtro).populate('genero', 'descricao');
    return res.status(200).json(acervos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar acervos.' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const acervo = await Acervo.findById(req.params.id).populate('genero', 'descricao');

    if (!acervo) {
      return res.status(404).json({ erro: 'Acervo não encontrado.' });
    }

    return res.status(200).json(acervo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar acervo.' });
  }
};

const criarAcervo = async (req, res) => {
  try {
    const { tipo, titulo, sinopse, direcao, ano, duracao, genero, class_etaria, foto_capa, tema, autores, elenco, link_video } = req.body;

    if (!tipo || !titulo || !sinopse || !direcao || !ano || !duracao || !genero) {
      return res.status(400).json({ erro: 'Tipo, título, sinopse, direção, ano, duração e gênero são obrigatórios.' });
    }

    if (tipo !== 'cine' && tipo !== 'curta') {
      return res.status(400).json({ erro: 'Tipo deve ser "cine" ou "curta".' });
    }

    const novoAcervo = await Acervo.create({
      tipo,
      titulo,
      sinopse,
      direcao,
      ano,
      duracao,
      genero,
      class_etaria,
      foto_capa,
      tema,
      autores,
      elenco,
      link_video,
    });

    return res.status(201).json({
      mensagem: 'Acervo criado com sucesso!',
      acervo: novoAcervo,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar acervo.' });
  }
};

const atualizarAcervo = async (req, res) => {
  try {
    const { tipo, titulo, sinopse, direcao, ano, duracao, genero, class_etaria, foto_capa, tema, autores, elenco, link_video } = req.body;

    const acervo = await Acervo.findByIdAndUpdate(
      req.params.id,
      { tipo, titulo, sinopse, direcao, ano, duracao, genero, class_etaria, foto_capa, tema, autores, elenco, link_video },
      { new: true }
    ).populate('genero', 'descricao');

    if (!acervo) {
      return res.status(404).json({ erro: 'Acervo não encontrado.' });
    }

    return res.status(200).json({
      mensagem: 'Acervo atualizado com sucesso!',
      acervo,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar acervo.' });
  }
};

const deletarAcervo = async (req, res) => {
  try {
    const acervo = await Acervo.findByIdAndDelete(req.params.id);

    if (!acervo) {
      return res.status(404).json({ erro: 'Acervo não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Acervo deletado com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao deletar acervo.' });
  }
};

module.exports = {
  buscarTodos,
  buscarPorId,
  criarAcervo,
  atualizarAcervo,
  deletarAcervo,
};
