const express = require('express');
const router = express.Router();
const { createReservation, getMyReservations, cancelReservation, getAllReservations, updateReservation } = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.patch('/:id/cancel', protect, cancelReservation);

// Admin
router.get('/', protect, adminOnly, getAllReservations);
router.patch('/:id', protect, adminOnly, updateReservation);

module.exports = router;
