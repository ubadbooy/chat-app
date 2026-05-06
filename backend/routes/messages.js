const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// دریافت لیست کاربران
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('-password')
      .sort({ lastSeen: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// جستجوی کاربران با customId یا username
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const searchQuery = query.trim().toLowerCase();
    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { customId: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } },
        { displayName: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .select('-password -email')
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// دریافت پیام‌های یک مکالمه
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'شناسه کاربر نامعتبر است' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    // علامت‌گذاری پیام‌ها به عنوان خوانده شده
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.userId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// ارسال پیام
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'شناسه گیرنده نامعتبر است' });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: 'متن پیام الزامی است' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'گیرنده یافت نشد' });
    }

    const message = new Message({
      sender: req.userId,
      receiver: receiverId,
      content: content.trim(),
      type
    });

    await message.save();
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// دریافت تعداد پیام‌های خوانده نشده
router.get('/unread', auth, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.userId,
      read: false
    });
    res.json({ count: unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

module.exports = router;
