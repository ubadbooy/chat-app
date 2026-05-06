const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Check if custom ID is available
router.get('/check-id/:customId', auth, async (req, res) => {
  try {
    const { customId } = req.params;
    
    if (!customId || customId.length < 3 || customId.length > 30) {
      return res.status(400).json({ 
        available: false, 
        message: 'شناسه باید بین ۳ تا ۳۰ کاراکتر باشد' 
      });
    }

    if (!/^[a-z0-9_]+$/.test(customId)) {
      return res.status(400).json({ 
        available: false, 
        message: 'فقط حروف انگلیسی کوچک، اعداد و _ مجاز است' 
      });
    }

    const existingUser = await User.findOne({ customId: customId.toLowerCase() });
    
    if (existingUser && existingUser._id.toString() !== req.userId) {
      return res.json({ available: false, message: 'این شناسه قبلاً استفاده شده است' });
    }

    res.json({ available: true, message: 'این شناسه در دسترس است' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// Create/Update profile
router.post('/setup', auth, async (req, res) => {
  try {
    const { customId, displayName, bio, avatar } = req.body;

    if (!customId || customId.length < 3 || customId.length > 30) {
      return res.status(400).json({ message: 'شناسه باید بین ۳ تا ۳۰ کاراکتر باشد' });
    }

    if (!/^[a-z0-9_]+$/.test(customId)) {
      return res.status(400).json({ message: 'فقط حروف انگلیسی کوچک، اعداد و _ مجاز است' });
    }

    // Check if customId is already taken by another user
    const existingUser = await User.findOne({ 
      customId: customId.toLowerCase(),
      _id: { $ne: req.userId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'این شناسه قبلاً استفاده شده است' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    user.customId = customId.toLowerCase();
    user.displayName = displayName || user.username;
    user.bio = bio || '';
    user.profileCompleted = true;
    
    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        customId: user.customId,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// Get user profile by custom ID
router.get('/user/:customId', auth, async (req, res) => {
  try {
    const user = await User.findOne({ customId: req.params.customId.toLowerCase() })
      .select('-password -email');
    
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// Update profile
router.put('/update', auth, async (req, res) => {
  try {
    const { displayName, bio, avatar } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      user: {
        id: user._id,
        customId: user.customId,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

module.exports = router;
