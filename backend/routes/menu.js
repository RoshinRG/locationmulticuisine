const express = require('express');
const router = express.Router();
const { getAllMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability, getCategories } = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getAllMenuItems);
router.get('/categories/list', getCategories);
router.get('/:id', getMenuItem);

// Admin only routes
router.post('/', protect, adminOnly, createMenuItem);
router.put('/:id', protect, adminOnly, updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);
router.patch('/:id/toggle', protect, adminOnly, toggleAvailability);

module.exports = router;
