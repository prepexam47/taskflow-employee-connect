
import { databases, DATABASE_ID, USERS_COLLECTION_ID, account, Query, ID } from '../config/appwrite';

// Create a user account and corresponding user document
export const createUser = async (email: string, password: string, name: string, role: string) => {
  try {
    // Create a user account
    const newAccount = await account.create(ID.unique(), email, password, name);
    
    // Create a user document in the database
    const newUser = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      {
        userId: newAccount.$id,
        email,
        name,
        role,
        aiTokensRemaining: role === 'admin' ? -1 : 1000, // -1 for unlimited
        createdAt: new Date().toISOString(),
      }
    );
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Get user by email
export const getUserByEmail = async (email: string) => {
  try {
    const users = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', email)]
    );
    
    return users.documents[0];
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};
