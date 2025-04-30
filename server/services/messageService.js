
const { databases, DATABASE_ID, MESSAGES_COLLECTION_ID, Query } = require('../config/appwrite');
const { ID } = require('node-appwrite');

// Send a message
const sendMessage = async (senderId, receiverId, content) => {
  try {
    const messageData = {
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    const message = await databases.createDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      ID.unique(),
      messageData
    );
    
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get conversation between two users
const getConversation = async (user1Id, user2Id) => {
  try {
    const messages = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [
        Query.or([
          Query.and([
            Query.equal('senderId', user1Id),
            Query.equal('receiverId', user2Id)
          ]),
          Query.and([
            Query.equal('senderId', user2Id),
            Query.equal('receiverId', user1Id)
          ])
        ])
      ]
    );
    
    return messages.documents.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

// Get all conversations for a user
const getAllConversations = async (userId) => {
  try {
    const sentMessages = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [Query.equal('senderId', userId)]
    );
    
    const receivedMessages = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [Query.equal('receiverId', userId)]
    );
    
    // Combine and find unique conversation partners
    const allMessages = [...sentMessages.documents, ...receivedMessages.documents];
    const conversationPartners = new Set();
    const conversations = [];
    
    allMessages.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversationPartners.has(partnerId)) {
        conversationPartners.add(partnerId);
        
        // Get the latest message for this conversation
        const latestMessage = allMessages
          .filter(m => 
            (m.senderId === userId && m.receiverId === partnerId) || 
            (m.senderId === partnerId && m.receiverId === userId)
          )
          .sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];
        
        conversations.push({
          partnerId,
          latestMessage
        });
      }
    });
    
    return conversations.sort((a, b) => 
      new Date(b.latestMessage.timestamp).getTime() - new Date(a.latestMessage.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error getting all conversations:', error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getAllConversations
};
