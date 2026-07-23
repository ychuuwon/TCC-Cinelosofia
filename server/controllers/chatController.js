const Chat = require('../models/chat');

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

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ erro: 'Chat não encontrado.' });
    }

    chat.comentarios.push({
      usuario: req.userId,
      texto,
      enviadoEm: new Date(),
    });

    await chat.save();

    const chatAtualizado = await Chat.findById(req.params.id).populate('comentarios.usuario', 'nome_usuario');

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

    if (comentario.usuario.toString() !== req.userId) {
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

module.exports = {
  buscarTodos,
  buscarPorId,
  criarChat,
  adicionarComentario,
  deletarComentario,
};
