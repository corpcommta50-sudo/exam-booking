const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ 
      $or: [{ email }, ...(studentId ? [{ studentId }] : [])]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.email === email 
          ? 'อีเมลนี้ถูกใช้งานแล้ว' 
          : 'รหัสนักศึกษานี้ถูกใช้งานแล้ว'
      });
    }

    const user = await User.create({ name, email, password, studentId });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอกอีเมลและรหัสผ่าน' 
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' 
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  res.json({ 
    success: true, 
    user: req.user 
  });
});

module.exports = router;
