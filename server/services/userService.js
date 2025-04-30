
const { databases, DATABASE_ID, USERS_COLLECTION_ID, account, Query } = require('../config/appwrite');
const { ID } = require('node-appwrite');

// Get user by email
const getUserByEmail = async (email) => {
  try {
    const users = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', email)]
    );
    
    if (users.documents.length === 0) {
      return null;
    }
    
    return users.documents[0];
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

// Get all users
const getAllUsers = async () => {
  try {
    const users = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID
    );
    
    return users.documents;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Create a new user
const createUser = async (email, password, name, role = 'employee') => {
  try {
    // First, create the user account
    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    );
    
    // Then, create the user document in the database
    const userData = {
      userId: user.$id,
      email,
      name,
      role,
      aiTokensRemaining: 10, // Default tokens for new users
      createdAt: new Date().toISOString()
    };
    
    const userDoc = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      userData
    );
    
    return userDoc;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user role
const updateUserRole = async (userId, role) => {
  try {
    const users = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    
    if (users.documents.length === 0) {
      throw new Error('User not found');
    }
    
    const userDoc = users.documents[0];
    
    const updatedUser = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userDoc.$id,
      { role }
    );
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

module.exports = {
  getUserByEmail,
  getAllUsers,
  createUser,
  updateUserRole
};
