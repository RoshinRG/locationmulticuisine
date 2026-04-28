const { MenuItem } = require('../models');
const { Op } = require('sequelize');

const getAllMenuItems = async (req, res) => {
  try {
    const { category, search, available, popular, sort, page = 1, limit = 50 } = req.query;
    let where = {};

    if (category && category !== 'all') where.category = category;
    if (available === 'true') where.isAvailable = true;
    if (popular === 'true') where.isPopular = true;

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } }
      ];
    }

    let order = [];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'rating') order = [['rating', 'DESC']];
    else if (sort === 'popular') order = [['isPopular', 'DESC'], ['rating', 'DESC']];
    else order = [['category', 'ASC'], ['name', 'ASC']];

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await MenuItem.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      count: rows.length,
      total: count,
      pages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      items: rows
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menu.' });
  }
};

const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching item.' });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, message: 'Created successfully.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create item.' });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found.' });
    await item.update(req.body);
    res.json({ success: true, message: 'Updated successfully.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found.' });
    await item.destroy();
    res.json({ success: true, message: 'Deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found.' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ success: true, message: `Updated availability.`, item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Toggle failed.' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = ['starters', 'biryani', 'grills', 'shawarma', 'seafood', 'desserts', 'drinks'];
    const result = await Promise.all(categories.map(async cat => {
      const count = await MenuItem.count({ where: { category: cat } });
      return { name: cat, count };
    }));
    res.json({ success: true, categories: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

module.exports = { getAllMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability, getCategories };
