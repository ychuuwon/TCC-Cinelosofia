const Chat = require('../models/chat');
const Denuncia = require('../models/denuncia');
const { verificarModeracaoOpenAI } = require('../utils/moderacao');
const { log } = require('../utils/logger');

const PALAVRAS_BANIDAS = [
  'puta', 'vagabunda', 'vai se fuder', 'vai se foder', 'arrombada',
  'cuzona', 'cuzão', 'filha da puta', 'filho da puta', 'pau no cu',
  'desgraçada', 'desgraçado', 'buceta', 'porra', 'piroca', 'xereca',
  'bucetuda', 'vadia', 'cadela', 'cachorra', 'prostituta', 'caralho', 
  'vsf', 'vsfd', 'cu', 'fodido', 'fudido', 'retardado', 'viado', 'nigga', 
  'nigger', 'v4di4', 'put4' 
];

const normalizarTexto = (texto) => String(texto)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const tokenizarTexto = (texto) => normalizarTexto(texto)
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean);

const contemPalavraBanida = async (texto) => {
  const tokensTexto = tokenizarTexto(texto);

  return PALAVRAS_BANIDAS.some((palavra) => {
    const tokensPalavra = tokenizarTexto(palavra);
    if (tokensPalavra.length === 0 || tokensPalavra.length > tokensTexto.length) {
      return false;
    }

    return tokensTexto.some((_, startIndex) => (
      tokensPalavra.every((token, offset) => tokensTexto[startIndex + offset] === token)
    ));
  });
};

// Função auxiliar para registrar denúncia automática
const registrarDenunciaModeracao = async (chatId, comentarioId, texto, motivoSinalizacao, categoriasInfracoes) => {
  try {
    await Denuncia.create({
      autor: 'Moderador IA',
      mensagem: texto,
      motivo: motivoSinalizacao,
      chatId,
      comentarioId,
      tipo: 'moderador',
      categoriasInfracoes,
      status: 'Pendente',
    });
    console.log(`✅ Denúncia automática registrada para comentário: ${comentarioId}`);
  } catch (error) {
    console.error('Erro ao registrar denúncia de moderação:', error);
  }
};

const buscarTodos = async (req, res) => {
  try {
    const chats = await Chat.find().populate('comentarios.usuario', 'nome_usuario');
    return res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar chats.' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate('comentarios.usuario', 'nome_usuario');

    if (!chat) {
      return res.status(404).json({ erro: 'Chat não encontrado.' });
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar chat.' });
  }
};

const criarChat = async (req, res) => {
  try {
    const { tema } = req.body;

    if (!tema) {
      return res.status(400).json({ erro: 'Tema é obrigatório.' });
    }

    const novoChat = await Chat.create({
      tema,
      comentarios: [],
    });

    return res.status(201).json({
      mensagem: 'Chat criado com sucesso!',
      chat: novoChat,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar chat.' });
  }
};

const adicionarComentario = async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ erro: 'Texto do comentário é obrigatório.' });
    }

    log('📝', 'Adicionando comentário:', texto.substring(0, 50) + '...');

    if (await contemPalavraBanida(texto)) {
      return res.status(422).json({ erro: 'Sua mensagem apresenta conteúdo ofensivo, repense :)' });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ erro: 'Chat não encontrado.' });
    }

    // Verificar moderação
    log('📝', 'Chamando verificarModeracaoOpenAI...');
    const resultadoModeracao = await verificarModeracaoOpenAI(texto);
    log('✅', 'Moderação verificada:', resultadoModeracao);

    // Adicionar comentário
    const novoComentario = {
      usuario: req.userId,
      texto,
      enviadoEm: new Date(),
      moderado: resultadoModeracao.flagged,
      motivoSinalizacao: resultadoModeracao.motivo,
      categoriasInfracoes: resultadoModeracao.categorias || [],
    };

    chat.comentarios.push(novoComentario);
    await chat.save();

    // Obter o ID do comentário recém-adicionado
    const comentarioAdicionado = chat.comentarios[chat.comentarios.length - 1];

    // Se foi sinalizado, criar denúncia automática
    if (resultadoModeracao.flagged) {
      await registrarDenunciaModeracao(
        chat._id,
        comentarioAdicionado._id,
        texto,
        resultadoModeracao.motivo,
        resultadoModeracao.categorias
      );
    }

    const chatAtualizado = await Chat.findById(req.params.id).populate('comentarios.usuario', 'nome_usuario');

    // Se foi sinalizado, avisar o cliente
    if (resultadoModeracao.flagged) {
      return res.status(202).json({
        mensagem: 'Comentário adicionado, mas foi sinalizado para revisão por conteúdo inapropriado.',
        aviso: resultadoModeracao.motivo,
        chat: chatAtualizado,
      });
    }

    return res.status(200).json({
      mensagem: 'Comentário adicionado com sucesso!',
      chat: chatAtualizado,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao adicionar comentário.' });
  }
};

const deletarComentario = async (req, res) => {
  try {
    const { chatId, comentarioId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ erro: 'Chat não encontrado.' });
    }

    const comentario = chat.comentarios.id(comentarioId);

    if (!comentario) {
      return res.status(404).json({ erro: 'Comentário não encontrado.' });
    }

    if (comentario.usuario.toString() !== req.userId && req.userTipo !== 'adm') {
      return res.status(403).json({ erro: 'Você não pode deletar este comentário.' });
    }

    comentario.deleteOne();
    await chat.save();

    return res.status(200).json({ mensagem: 'Comentário deletado com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao deletar comentário.' });
  }
};

const buscarComentariosSinalizados = async (req, res) => {
  try {
    // Apenas admin
    const chats = await Chat.find({
      'comentarios.moderado': true,
    }).populate('comentarios.usuario', 'nome_usuario email');

    const comentariosSinalizados = [];

    chats.forEach((chat) => {
      chat.comentarios.forEach((comentario) => {
        if (comentario.moderado) {
          comentariosSinalizados.push({
            chatId: chat._id,
            chatTema: chat.tema,
            comentarioId: comentario._id,
            usuario: comentario.usuario,
            texto: comentario.texto,
            enviadoEm: comentario.enviadoEm,
            motivoSinalizacao: comentario.motivoSinalizacao,
            categoriasInfracoes: comentario.categoriasInfracoes,
          });
        }
      });
    });

    // Ordenar por data (mais recentes primeiro)
    comentariosSinalizados.sort((a, b) => new Date(b.enviadoEm) - new Date(a.enviadoEm));

    return res.status(200).json({
      total: comentariosSinalizados.length,
      comentarios: comentariosSinalizados,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar comentários sinalizados.' });
  }
};

const aprovarComentario = async (req, res) => {
  try {
    const { chatId, comentarioId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ erro: 'Chat não encontrado.' });
    }

    const comentario = chat.comentarios.id(comentarioId);

    if (!comentario) {
      return res.status(404).json({ erro: 'Comentário não encontrado.' });
    }

    // Remover sinalização
    comentario.moderado = false;
    comentario.motivoSinalizacao = null;
    comentario.categoriasInfracoes = [];

    await chat.save();

    return res.status(200).json({
      mensagem: 'Comentário aprovado!',
      comentario,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao aprovar comentário.' });
  }
};

const rejeitar = async (req, res) => {
  try {
    const { chatId, comentarioId } = req.params;
    const { motivo } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ erro: 'Chat não encontrado.' });
    }

    const comentario = chat.comentarios.id(comentarioId);

    if (!comentario) {
      return res.status(404).json({ erro: 'Comentário não encontrado.' });
    }

    // Deletar comentário
    comentario.deleteOne();
    await chat.save();

    console.log(`✅ Comentário deletado por admin. Motivo: ${motivo || 'Conteúdo inapropriado'}`);

    return res.status(200).json({
      mensagem: 'Comentário removido com sucesso!',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao rejeitar comentário.' });
  }
};

module.exports = {
  contemPalavraBanida,
  buscarTodos,
  buscarPorId,
  criarChat,
  adicionarComentario,
  deletarComentario,
  buscarComentariosSinalizados,
  aprovarComentario,
  rejeitar,
};
