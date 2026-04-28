const { Bill, Order, User } = require('../models');

const getAllBills = async (req, res) => {
  try {
    const { paymentStatus, page = 1, limit = 20 } = req.query;
    let where = {};
    if (paymentStatus) where.paymentStatus = paymentStatus;
    const offset = (parseInt(page)-1) * parseInt(limit);
    const { count, rows } = await Bill.findAndCountAll({
      where,
      include: [{ model: Order, as: 'order', attributes: ['orderNumber'] }, { model: User, as: 'customer', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    res.json({ success: true, total: count, bills: rows });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const getBill = async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? { id: req.params.id } : { id: req.params.id, UserId: req.user.id };
    const bill = await Bill.findOne({
      where,
      include: [{ model: Order, as: 'order' }, { model: User, as: 'customer', attributes: ['name', 'email', 'phone'] }]
    });
    if (!bill) return res.status(404).json({ success: false });
    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const getMyBills = async (req, res) => {
  try {
    const bills = await Bill.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Order, as: 'order', attributes: ['orderNumber'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ success: false });

    await bill.update({ paymentStatus, paymentMethod, paymentDate: paymentStatus === 'paid' ? new Date() : null });
    if (bill.OrderId) {
      await Order.update({ paymentStatus }, { where: { id: bill.OrderId } });
    }
    res.json({ success: true, message: 'Payment updated.', bill });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

module.exports = { getAllBills, getBill, getMyBills, updatePaymentStatus };
