/**
 * Auth Controller - Signup, Login, Profile management (Sequelize/SQLite)
 */
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route POST /api/auth/signup
// @access Public
const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role, adminSecret } = req.body;

    // Prevent unauthorized admin creation
    if (role === "admin") {
      const isOwner = adminSecret === process.env.OWNER_SECRET_KEY;
      const isStaff = adminSecret === process.env.STAFF_SECRET_KEY;
      
      if (!isOwner && !isStaff) {
        return res.status(403).json({ success: false, message: "Invalid admin secret key." });
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    // Create user (password will be hashed by model hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      password,
      role: role === "admin" ? "admin" : "customer",
      isVerified: true
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
};

// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Get user
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "Account deactivated." });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user.id);
    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed." });
  }
};

// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile." });
  }
};

// @route PUT /api/auth/profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, street, city, pincode } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    await user.update({ name, phone, street, city, pincode });
    res.json({ success: true, message: "Profile updated successfully.", user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Profile update failed." });
  }
};

// @route PUT /api/auth/change-password
// @access Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Password change failed." });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword
};
