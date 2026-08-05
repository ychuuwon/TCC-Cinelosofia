const RegistroEncontro = require('../models/registroEncontro');
const Encontro = require('../models/encontro');

const mapearSnapshot = (encontro) => ({
  tema: encontro.tema || '',
  sinopse: encontro.sinopse || '',
  direcao: encontro.direcao || '',
  ano: encontro.ano || undefined,
  genero: encontro.genero || '',
  foto_capa: encontro.foto_capa || '',
  data: encontro.data || undefined,
  hora: encontro.hora || '',
  local: encontro.local || '',
  duracao: encontro.duracao || '',
  obs: encontro.obs || '',
  trailer: encontro.trailer || '',
});

const buscarTodos = async (req, res) => {
  try {
    const registros = await RegistroEncontro.find()
      .sort({ createdAt: -1 })
      .populate('encontro_original');

    return res.status(200).json(registros);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar registros de encontros.' });
  }
};

const criarRegistro = async (req, res) => {
  try {
    const { encontroId, questoes_discussao } = req.body;

    if (!encontroId || !questoes_discussao) {
      return res.status(400).json({ erro: 'Encontro e questões de discussão são obrigatórios.' });
    }

    const encontro = await Encontro.findById(encontroId);

    if (!encontro) {
      return res.status(404).json({ erro: 'Encontro não encontrado.' });
    }

    const registro = await RegistroEncontro.create({
      encontro_original: encontro._id,
      encontro_snapshot: mapearSnapshot(encontro),
      questoes_discussao,
    });

    return res.status(201).json({
      mensagem: 'Registro de encontro criado com sucesso!',
      registro,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar registro de encontro.' });
  }
};

const deletarRegistro = async (req, res) => {
  try {
    const registro = await RegistroEncontro.findByIdAndDelete(req.params.id);

    if (!registro) {
      return res.status(404).json({ erro: 'Registro de encontro não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Registro de encontro removido com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao remover registro de encontro.' });
  }
};

module.exports = {
  buscarTodos,
  criarRegistro,
  deletarRegistro,
};