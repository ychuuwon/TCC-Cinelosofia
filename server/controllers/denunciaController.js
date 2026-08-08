const Denuncia = require('../models/denuncia');
const Chat = require('../models/chat');

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
    const { autor, mensagem, motivo, chatId, comentarioId } = req.body;

    if (!mensagem || String(mensagem).trim() === '') {
      return res.status(400).json({ erro: 'Mensagem da denúncia é obrigatória.' });
    }

    const nova = await Denuncia.create({
      autor,
      mensagem: String(mensagem).trim(),
      motivo,
      chatId: chatId || undefined,
      comentarioId: comentarioId || undefined,
    });
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

const atualizarAcaoMensagem = async (req, res) => {
  try {
    const { acao } = req.body;

    if (!['Pendente', 'Mantida', 'Removida'].includes(acao)) {
      return res.status(400).json({ erro: 'Ação inválida.' });
    }

    const denuncia = await Denuncia.findById(req.params.id);
    if (!denuncia) {
      return res.status(404).json({ erro: 'Denúncia não encontrada.' });
    }

    if (acao === 'Removida') {
      if (!denuncia.chatId || !denuncia.comentarioId) {
        return res.status(400).json({ erro: 'Esta denúncia não possui vínculo com uma mensagem do chat.' });
      }

      const chat = await Chat.findById(denuncia.chatId);
      if (!chat) {
        return res.status(404).json({ erro: 'Chat da denúncia não encontrado.' });
      }

      const comentario = chat.comentarios.id(denuncia.comentarioId);
      if (!comentario) {
        return res.status(404).json({ erro: 'Comentário da denúncia não encontrado.' });
      }

      comentario.deleteOne();
      await chat.save();
    }

    denuncia.acaoMensagem = acao;
    await denuncia.save();

    return res.status(200).json(denuncia);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar a ação da mensagem.' });
  }
};

module.exports = {
  listarDenuncias,
  criarDenuncia,
  deletarDenuncia,
  atualizarStatus,
  atualizarAcaoMensagem,
};
