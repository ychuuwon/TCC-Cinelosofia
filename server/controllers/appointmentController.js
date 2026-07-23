const Encontro = require('../models/encontro');

const createAppointment = async (req, res) => {
  try {
    const { tema, data, hora, local, duracao, obs } = req.body;

    if (!tema || !data || !hora || !local) {
      return res.status(400).json({ erro: 'Tema, data, hora e local são obrigatórios.' });
    }

    const appointment = await Encontro.create({
      tema,
      data,
      hora,
      local,
      duracao,
      obs,
      presencas: [],
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar agendamento.' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Encontro.find().sort({ data: 1 });
    return res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar agendamentos.' });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Encontro.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar agendamento.' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Encontro.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!appointment) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar agendamento.' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Encontro.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Agendamento removido com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao remover agendamento.' });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};