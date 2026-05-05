const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ثبت‌نام
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'نام کاربری، ایمیل و رمز عبور الزامی است' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' });
    }

    // بررسی وجود کاربر
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'کاربر قبلاً ثبت‌نام کرده است' });
    }

    // ساخت کاربر جدید
    user = new User({ username, email, password });
    await user.save();

    // ساخت توکن
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// ورود
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'ایمیل و رمز عبور الزامی است' });
    }

    // پیدا کردن کاربر
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'ایمیل یا رمز عبور اشتباه است' });
    }

    // بررسی رمز عبور
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'ایمیل یا رمز عبور اشتباه است' });
    }

    // ساخت توکن
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// دریافت اطلاعات کاربر
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// خروج
router.post('/logout', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      status: 'offline',
      lastSeen: new Date()
    });
    res.json({ message: 'خروج موفق' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

module.exports = router;
