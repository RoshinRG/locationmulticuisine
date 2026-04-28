const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllCustomers, toggleCustomerStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/customers', getAllCustomers);
router.patch('/customers/:id/toggle', toggleCustomerStatus);

module.exports = router;
