const Appointment = require('../models/appointment');

const createAppointment = async (req, res) => {
  try {
    const { service, date, notes } = req.body;

    if (!service || !date) {
      return res.status(400).json({ erro: 'Serviço e data são obrigatórios.' });
    }

    const appointment = await Appointment.create({
      usuario: req.userId,
      service,
      date,
      notes,
    });

    return res.status(201).json({
      mensagem: 'Agendamento realizado com sucesso!',
      appointment,
      message: 'Agendamento realizado com sucesso!',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar agendamento.' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { usuario: req.userId };

    if (status) {
      const validStatuses = ['pendente', 'concluido', 'cancelado'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ erro: 'Status inválido.' });
      }
      filter.status = status;
    }

    const appointments = await Appointment.find(filter).sort({ date: -1 });
    return res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar agendamentos.' });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    if (appointment.usuario.toString() !== req.userId && req.userTipo !== 'adm') {
      return res.status(403).json({ erro: 'Acesso negado ao agendamento.' });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar agendamento.' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    if (appointment.usuario.toString() !== req.userId && req.userTipo !== 'adm') {
      return res.status(403).json({ erro: 'Acesso negado ao agendamento.' });
    }

    const updateData = {};
    const { service, date, notes, status } = req.body;

    if (service !== undefined) updateData.service = service;
    if (date !== undefined) updateData.date = date;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true });

    return res.status(200).json({
      mensagem: 'Agendamento atualizado com sucesso!',
      appointment: updatedAppointment,
      message: 'Agendamento atualizado com sucesso!',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar agendamento.' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    if (appointment.usuario.toString() !== req.userId && req.userTipo !== 'adm') {
      return res.status(403).json({ erro: 'Acesso negado ao agendamento.' });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    return res.status(200).json({ mensagem: 'Agendamento removido com sucesso!', message: 'Agendamento removido com sucesso!' });
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