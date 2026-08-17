const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const getOrCreateConversation = async (userId1, userId2, productId, requestId = null) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [userId1, userId2] },
    productId,
  }).populate('participants', 'name profileImage approximateLocation studyYear course');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId1, userId2],
      productId,
      requestId,
      lastMessage: 'Conversation started',
      lastMessageAt: new Date(),
    });
    conversation = await Conversation.findById(conversation._id).populate(
      'participants',
      'name profileImage approximateLocation studyYear course'
    );
  }

  return conversation;
};

const saveMessage = async (conversationId, senderId, text) => {
  const message = await Message.create({
    conversationId,
    senderId,
    text,
    readBy: [senderId],
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: text,
    lastMessageAt: new Date(),
  });

  return message;
};

module.exports = {
  getOrCreateConversation,
  saveMessage,
};
