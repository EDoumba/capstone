const express = require('express');
const router = express.Router();
const {
  getConversation,
  getConversations,
  sendMessage,
  markAsRead
} = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

router.get('/conversations', auth, getConversations);
router.get('/conversation/:other_user_id', auth, getConversation);
router.post('/message', auth, sendMessage);
router.put('/read/:sender_id', auth, markAsRead);

module.exports = router;