const jwt = require('jsonwebtoken');
const Conversation = require('../models/Conversation');
const { saveMessage } = require('../services/chatService');

const initChatSocket = (io) => {
  // Socket auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Authentication token missing'));

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'rentmate_super_secret_jwt_key_2026'
      );
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] User connected: ${socket.userId}`);

    // Join personal user room for private notifications
    socket.join(socket.userId);

    // Join conversation room with participant verification (Rule 47)
    socket.on('joinConversation', async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        const isParticipant = conversation.participants.some((p) => {
          if (!p) return false;
          const pId = p._id ? p._id.toString() : p.toString();
          return pId === socket.userId.toString();
        });

        if (!isParticipant && socket.userRole !== 'ADMIN') {
          return socket.emit('error', { message: 'Forbidden: Not a conversation participant' });
        }

        socket.join(conversationId);
        console.log(`[Socket.IO] User ${socket.userId} joined conversation ${conversationId}`);
      } catch (err) {
        socket.emit('error', { message: 'Error joining conversation' });
      }
    });

    socket.on('leaveConversation', ({ conversationId }) => {
      socket.leave(conversationId);
    });

    socket.on('sendMessage', async ({ conversationId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const message = await saveMessage(conversationId, socket.userId, text.trim());
        const populatedMsg = {
          _id: message._id,
          conversationId,
          senderId: { _id: socket.userId },
          text: message.text,
          createdAt: message.createdAt,
        };

        // Broadcast to conversation room
        io.to(conversationId).emit('receiveMessage', populatedMsg);

        // Also broadcast directly to all participants' user rooms for real-time sidebar & instant updates
        conversation.participants.forEach((p) => {
          if (p) {
            const pIdStr = p._id ? p._id.toString() : p.toString();
            io.to(pIdStr).emit('receiveMessage', populatedMsg);
            io.to(pIdStr).emit('conversationUpdated', {
              conversationId,
              lastMessage: text.trim(),
              lastMessageAt: message.createdAt,
            });
          }
        });
      } catch (err) {
        console.error('[Socket.IO SendMessage Error]', err);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    socket.on('typing', ({ conversationId }) => {
      socket.to(conversationId).emit('typing', { userId: socket.userId, conversationId });
    });

    socket.on('stopTyping', ({ conversationId }) => {
      socket.to(conversationId).emit('stopTyping', { userId: socket.userId, conversationId });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = initChatSocket;
