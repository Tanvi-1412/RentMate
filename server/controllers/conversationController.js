const Conversation = require('../models/Conversation');
const { getOrCreateConversation } = require('../services/chatService');
const { sendSuccess, sendError } = require('../utils/response');

const getUserConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.userId,
    })
      .populate('participants', 'name profileImage approximateLocation studyYear course status isVerified')
      .populate('productId', 'title images price transactionType')
      .sort({ lastMessageAt: -1 });

    return sendSuccess(res, 200, 'Conversations fetched', conversations);
  } catch (error) {
    next(error);
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name profileImage approximateLocation studyYear course status isVerified')
      .populate('productId', 'title images price transactionType ownerId availability');

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

    return sendSuccess(res, 200, 'Conversation fetched', conversation);
  } catch (error) {
    next(error);
  }
};

const startConversation = async (req, res, next) => {
  try {
    const { sellerId, productId, requestId } = req.body;
    if (!sellerId || !productId) {
      return sendError(res, 400, 'sellerId and productId are required');
    }

    if (sellerId.toString() === req.user.userId.toString()) {
      return sendError(res, 400, 'You cannot start a chat with yourself');
    }

    const conversation = await getOrCreateConversation(
      req.user.userId,
      sellerId,
      productId,
      requestId
    );

    return sendSuccess(res, 200, 'Conversation initialized', conversation);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserConversations,
  getConversationById,
  startConversation,
};
