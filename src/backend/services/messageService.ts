
import { databases, DATABASE_ID, MESSAGES_COLLECTION_ID, Query, ID } from '../config/appwrite';

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  try {
    const newMessage = await databases.createDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        senderId,
        receiverId,
        content,
        readStatus: false,
        createdAt: new Date().toISOString(),
      }
    );
    
    return newMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (userId: string) => {
  try {
    const messages = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [Query.equal('receiverId', userId)]
    );
    
    return messages.documents;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};
