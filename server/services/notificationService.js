const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendWhatsAppMessage } = require('./whatsappService');

// Socket instance will be attached on startup
let ioInstance = null;

const setIo = (io) => {
  ioInstance = io;
};

const getIo = () => ioInstance;

const createAndSendNotification = async ({
  recipientId,
  type,
  title,
  message,
  relatedProductId = null,
  relatedRequestId = null,
  relatedConversationId = null,
}) => {
  try {
    // 1. Save in MongoDB
    const notification = await Notification.create({
      recipientId,
      type,
      title,
      message,
      relatedProductId,
      relatedRequestId,
      relatedConversationId,
    });

    // 2. Real-time emit over Socket.IO if connected
    if (ioInstance) {
      ioInstance.to(recipientId.toString()).emit('notification:new', notification);
    }

    // 3. Optional WhatsApp notification
    const recipient = await User.findById(recipientId);
    if (recipient && recipient.phone) {
      await sendWhatsAppMessage(recipient.phone, `[RentMate] ${title}: ${message}`);
    }

    return notification;
  } catch (error) {
    console.error('[NotificationService] Error sending notification:', error.message);
  }
};

module.exports = {
  setIo,
  getIo,
  createAndSendNotification,
};
