const { User, Order, Reservation, OrderItem, sequelize } = require('../models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders,
      activeOrders,
      totalCustomers,
      pendingReservations,
      todayOrders,
      monthOrders,
      totalRevenue,
      monthRevenue,
      recentOrders
    ] = await Promise.all([
      Order.count(),
      Order.count({ where: { status: { [Op.in]: ['pending', 'accepted', 'preparing', 'dispatched'] } } }),
      User.count({ where: { role: 'customer' } }),
      Reservation.count({ where: { status: 'pending' } }),
      Order.count({ where: { createdAt: { [Op.gte]: startOfDay } } }),
      Order.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      Order.sum('totalAmount', { where: { status: 'delivered' } }),
      Order.sum('totalAmount', { where: { status: 'delivered', createdAt: { [Op.gte]: startOfMonth } } }),
      Order.findAll({
        include: [{ model: User, as: 'customer', attributes: ['name', 'email'] }, { model: OrderItem, as: 'items' }],
        order: [['createdAt', 'DESC']],
        limit: 5
      })
    ]);

    // Popular Items (Approximated with simple query since aggregations are complex in Sequelize)
    const popularItems = await OrderItem.findAll({
      attributes: ['name', [sequelize.fn('sum', sequelize.col('quantity')), 'count'], [sequelize.fn('sum', sequelize.col('subtotal')), 'revenue']],
      group: ['name'],
      order: [[sequelize.col('count'), 'DESC']],
      limit: 5
    });

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        start: new Date(new Date(d).setHours(0, 0, 0, 0)),
        end: new Date(new Date(d).setHours(23, 59, 59, 999))
      });
    }

    const dailyData = await Promise.all(last7Days.map(async day => {
      const count = await Order.count({ where: { createdAt: { [Op.between]: [day.start, day.end] } } });
      const rev = await Order.sum('totalAmount', { where: { status: 'delivered', createdAt: { [Op.between]: [day.start, day.end] } } });
      return { date: day.label, orders: count, revenue: rev || 0 };
    }));

    res.json({
      success: true,
      stats: {
        totalOrders, activeOrders, totalCustomers, pendingReservations,
        todayOrders, monthOrders,
        totalRevenue: totalRevenue || 0,
        monthRevenue: monthRevenue || 0
      },
      recentOrders,
      popularItems: popularItems.map(i => ({ _id: i.name, count: i.get('count'), revenue: i.get('revenue') })),
      dailyData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let where = { role: 'customer' };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    const offset = (parseInt(page)-1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where, order: [['createdAt', 'DESC']], limit: parseInt(limit), offset
    });
    res.json({ success: true, total: count, customers: rows });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const toggleCustomerStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ success: false });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: 'Updated.', user });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

module.exports = { getDashboardStats, getAllCustomers, toggleCustomerStatus };
