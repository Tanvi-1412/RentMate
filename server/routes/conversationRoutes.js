const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const checkCollege = require('../middleware/checkCollege');
const {
  getUserConversations,
  getConversationById,
  startConversation,
} = require('../controllers/conversationController');
const { getMessages, postMessage } = require('../controllers/messageController');

router.use(authenticate, checkCollege);

router.get('/', getUserConversations);
router.post('/', startConversation);
router.get('/:id', getConversationById);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', postMessage);

module.exports = router;
