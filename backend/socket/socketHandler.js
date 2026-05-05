const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');

const setupSocket = (io) => {
  const userSockets = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`کاربر متصل شد: ${socket.username} (${socket.userId})`);
    
    userSockets.set(socket.userId, socket.id);

    await User.findByIdAndUpdate(socket.userId, {
      status: 'online',
      lastSeen: new Date()
    });

    io.emit('user-status', {
      userId: socket.userId,
      status: 'online'
    });

    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content, type = 'text' } = data;

        if (!mongoose.Types.ObjectId.isValid(receiverId) || !content?.trim()) {
          socket.emit('message-error', { message: 'پیام نامعتبر است' });
          return;
        }

        const message = new Message({
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim(),
          type
        });

        await message.save();
        await message.populate('sender', 'username avatar');

        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive-message', message);
        }

        socket.emit('message-sent', message);
      } catch (error) {
        socket.emit('message-error', { message: 'خطا در ارسال پیام' });
      }
    });

    socket.on('typing', (data) => {
      const receiverSocketId = userSockets.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-typing', {
          userId: socket.userId,
          username: socket.username
        });
      }
    });

    socket.on('stop-typing', (data) => {
      const receiverSocketId = userSockets.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-stop-typing', {
          userId: socket.userId
        });
      }
    });

    socket.on('mark-as-read', async (data) => {
      try {
        await Message.updateMany(
          {
            sender: data.senderId,
            receiver: socket.userId,
            read: false
          },
          {
            read: true,
            readAt: new Date()
          }
        );

        const senderSocketId = userSockets.get(data.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages-read', {
            userId: socket.userId
          });
        }
      } catch (error) {
        console.error('خطا در علامت‌گذاری پیام‌ها:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`کاربر قطع شد: ${socket.username}`);
      
      userSockets.delete(socket.userId);

      await User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        lastSeen: new Date()
      });

      io.emit('user-status', {
        userId: socket.userId,
        status: 'offline',
        lastSeen: new Date()
      });
    });
  });
};

module.exports = setupSocket;
