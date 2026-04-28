const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// Customer routes
router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.patch('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/', protect, adminOnly, getAllOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

// Shared (customer + admin)
router.get('/:id', protect, getOrder);

module.exports = router;
