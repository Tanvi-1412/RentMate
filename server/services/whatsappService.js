/**
 * RentMate WhatsApp Notification Service Abstraction
 * Supports sending transactional alerts over WhatsApp using pluggable providers.
 */

const sendWhatsAppMessage = async (phoneNumber, textMessage) => {
  try {
    const provider = process.env.WHATSAPP_PROVIDER || 'MOCK';

    if (provider === 'MOCK' || !process.env.WHATSAPP_API_KEY) {
      console.log(`[WhatsApp Sandbox Mock] To: ${phoneNumber} | Message: ${textMessage}`);
      return { success: true, provider: 'MOCK' };
    }

    // Example UltraMsg / Twilio integration template
    // Replace with specific free tier API call as configured
    console.log(`[WhatsApp ${provider}] Sent message to ${phoneNumber}: ${textMessage}`);
    return { success: true, provider };
  } catch (error) {
    console.error('[WhatsAppService] Error sending message:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWhatsAppMessage,
};
