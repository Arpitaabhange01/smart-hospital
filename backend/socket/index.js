const jwt = require('jsonwebtoken');
const User = require('../models/User');

const onlineUsers = new Map();

function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    const room = `user:${user._id}`;
    socket.join(room);
    onlineUsers.set(user._id.toString(), { userId: user._id, name: user.name, role: user.role, socketId: socket.id });

    socket.on('disconnect', () => {
      onlineUsers.delete(user._id.toString());
    });
  });

  return io;
}

function getIO(io) {
  return io;
}

module.exports = { setupSocket, getIO, onlineUsers };
