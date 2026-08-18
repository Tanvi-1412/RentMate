const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { saveMessage } = require('../services/chatService');
const { sendSuccess, sendError } = require('../utils/response');

const getMessages = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => {
      if (!p) return false;
      const pId = p._id ? p._id.toString() : p.toString();
      return pId === req.user.userId.toString();
    });

    if (!isParticipant && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Forbidden: You are not a participant in this conversation');
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: 1 });

    return sendSuccess(res, 200, 'Messages fetched', messages);
  } catch (error) {
    next(error);
  }
};

const postMessage = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return sendError(res, 400, 'Message text cannot be empty');
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => {
      if (!p) return false;
      const pId = p._id ? p._id.toString() : p.toString();
      return pId === req.user.userId.toString();
    });

    if (!isParticipant && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Forbidden: You are not a participant in this conversation');
    }

    const message = await saveMessage(conversationId, req.user.userId, text.trim());
    const populated = await Message.findById(message._id).populate('senderId', 'name profileImage');

    // Broadcast over Socket.IO to real-time clients
    const { getIo } = require('../services/notificationService');
    const io = getIo();
    if (io) {
      io.to(conversationId).emit('receiveMessage', populated);
      conversation.participants.forEach((p) => {
        if (p) {
          const pIdStr = p._id ? p._id.toString() : p.toString();
          io.to(pIdStr).emit('receiveMessage', populated);
          io.to(pIdStr).emit('conversationUpdated', {
            conversationId,
            lastMessage: text.trim(),
            lastMessageAt: message.createdAt,
          });
        }
      });
    }

    return sendSuccess(res, 201, 'Message sent', populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  postMessage,
};
