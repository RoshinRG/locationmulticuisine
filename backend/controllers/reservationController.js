const { Reservation, User } = require('../models');
const { Op } = require('sequelize');

const createReservation = async (req, res) => {
  try {
    const { date, time, guests, specialRequest, occasion } = req.body;
    const reservationDate = new Date(date);
    if (reservationDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Date must be in the future.' });
    }

    const reservation = await Reservation.create({
      UserId: req.user.id,
      customerName: req.user.name,
      customerPhone: req.user.phone,
      customerEmail: req.user.email,
      date: reservationDate,
      time,
      guests,
      specialRequest,
      occasion
    });

    res.status(201).json({ success: true, message: `Reservation submitted! #${reservation.reservationId}`, reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create reservation.' });
  }
};

const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed.' });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!reservation || !['pending', 'approved'].includes(reservation.status)) return res.status(400).json({ success: false });
    await reservation.update({ status: 'cancelled' });
    res.json({ success: true, message: 'Cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    let where = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      where.date = { [Op.between]: [new Date(d.setHours(0,0,0,0)), new Date(d.setHours(23,59,59,999))] };
    }
    const offset = (parseInt(page)-1) * parseInt(limit);
    const { count, rows } = await Reservation.findAndCountAll({
      where,
      include: [{ model: User, as: 'customer', attributes: ['name', 'email'] }],
      order: [['date', 'ASC']],
      limit: parseInt(limit),
      offset
    });
    res.json({ success: true, total: count, reservations: rows });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const updateReservation = async (req, res) => {
  try {
    const { status, tableNumber, adminNote } = req.body;
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ success: false });
    await reservation.update({ status, tableNumber, adminNote });
    res.json({ success: true, message: 'Updated.', reservation });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

module.exports = { createReservation, getMyReservations, cancelReservation, getAllReservations, updateReservation };
