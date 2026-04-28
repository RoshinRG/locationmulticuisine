const { Order, OrderItem, StatusHistory, MenuItem, Bill, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const GST_RATE = 0.05;
const DELIVERY_CHARGE = 40;

const placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { items, deliveryAddress, orderType, paymentMethod, notes, couponCode } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Cart empty.' });

    let subtotal = 0;
    const itemsToCreate = [];

    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ 
          success: false, 
          message: `One or more items in your cart (ID: ${item.menuItemId}) are no longer available. Please clear your cart and try again.` 
        });
      }
      if (!menuItem.isAvailable) throw new Error(`${menuItem.name} is currently unavailable.`);

      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;
      itemsToCreate.push({
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    let discount = 0;
    const validCoupons = { 'WELCOME10': 0.10, 'LOCATION20': 0.20 };
    if (couponCode && validCoupons[couponCode.toUpperCase()]) {
      discount = subtotal * validCoupons[couponCode.toUpperCase()];
    }

    const tax = (subtotal - discount) * GST_RATE;
    const delCharge = orderType === 'delivery' ? DELIVERY_CHARGE : 0;
    const totalAmount = subtotal - discount + tax + delCharge;

    const order = await Order.create({
      UserId: req.user.id,
      customerName: req.user.name,
      customerPhone: req.user.phone,
      customerEmail: req.user.email,
      street: deliveryAddress?.street,
      city: deliveryAddress?.city,
      pincode: deliveryAddress?.pincode,
      landmark: deliveryAddress?.landmark,
      orderType: orderType || 'delivery',
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      deliveryCharge: delCharge,
      discount: Math.round(discount * 100) / 100,
      couponCode: couponCode?.toUpperCase(),
      totalAmount: Math.round(totalAmount * 100) / 100,
      paymentMethod: paymentMethod || 'cash',
      notes,
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000)
    }, { transaction });

    for (const item of itemsToCreate) {
      await OrderItem.create({ ...item, OrderId: order.id }, { transaction });
    }

    await StatusHistory.create({ OrderId: order.id, status: 'pending' }, { transaction });

    await transaction.commit();
    res.status(201).json({ success: true, message: `Order placed! #${order.orderNumber}`, order });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Place order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Order failed.' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { UserId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed.' });
  }
};

const getOrder = async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? { id: req.params.id } : { id: req.params.id, UserId: req.user.id };
    const order = await Order.findOne({
      where,
      include: [{ model: OrderItem, as: 'items' }, { model: StatusHistory, as: 'statusHistory' }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error.' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!order || !['pending', 'accepted'].includes(order.status)) return res.status(400).json({ success: false });
    await order.update({ status: 'cancelled' });
    res.json({ success: true, message: 'Cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, date } = req.query;
    let where = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      where.createdAt = { [Op.between]: [new Date(d.setHours(0, 0, 0, 0)), new Date(d.setHours(23, 59, 59, 999))] };
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: User, as: 'customer', attributes: ['name', 'email'] }, { model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    res.json({ success: true, total: count, pages: Math.ceil(count / parseInt(limit)), orders: rows });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'items' }] });
    if (!order) return res.status(404).json({ success: false });

    await order.update({ status });
    await StatusHistory.create({ OrderId: order.id, status, note });

    if (status === 'delivered') {
      await Bill.create({
        OrderId: order.id,
        UserId: order.UserId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        itemsJson: order.items.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.price, subtotal: i.subtotal })),
        subtotal: order.subtotal,
        cgst: order.tax / 2,
        sgst: order.tax / 2,
        totalTax: order.tax,
        deliveryCharge: order.deliveryCharge,
        discount: order.discount,
        grandTotal: order.totalAmount,
        paymentMethod: order.paymentMethod,
        IssuedById: req.user.id
      });
      await order.update({ paymentStatus: order.paymentMethod === 'cash' ? 'pending' : 'paid' });
    }

    res.json({ success: true, message: `Updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

module.exports = { placeOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus };
