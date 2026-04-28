const express = require('express');
const router = express.Router();
const { getAllBills, getBill, getMyBills, updatePaymentStatus } = require('../controllers/billController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/my', protect, getMyBills);
router.get('/:id', protect, getBill);
router.get('/', protect, adminOnly, getAllBills);
router.patch('/:id/payment', protect, adminOnly, updatePaymentStatus);

module.exports = router;
