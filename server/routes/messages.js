
const express = require('express');
const { sendMessage, getConversation, getAllConversations } = require('../services/messageService');

const router = express.Router();

// Send a message
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = await sendMessage(senderId, receiverId, content);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
});

// Get conversation between two users
router.get('/conversation', async (req, res) => {
  try {
    const { user1Id, user2Id } = req.query;
    
    if (!user1Id || !user2Id) {
      return res.status(400).json({
        success: false,
        message: 'Both user IDs are required'
      });
    }
    
    const messages = await getConversation(user1Id, user2Id);
    
    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
});

// Get all conversations for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await getAllConversations(userId);
    
    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

module.exports = router;
