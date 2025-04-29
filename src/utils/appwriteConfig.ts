
import { Account, Client, Databases, Storage, ID, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1') // Set your Appwrite endpoint
  .setProject('taskflow-employee-connect'); // Your project ID - this would need to be updated

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database and collection IDs
export const DATABASE_ID = 'taskflow-database';
export const USERS_COLLECTION_ID = 'users';
export const TASKS_COLLECTION_ID = 'tasks';
export const MESSAGES_COLLECTION_ID = 'messages';
export const ATTENDANCE_COLLECTION_ID = 'attendance';
export const AI_USAGE_COLLECTION_ID = 'ai_usage';

// User roles
export const ROLE_ADMIN = 'admin';
export const ROLE_EMPLOYEE = 'employee';

// Helper functions
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
        aiTokensRemaining: role === ROLE_ADMIN ? -1 : 1000, // -1 for unlimited
        createdAt: new Date().toISOString(),
      }
    );
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

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

export const createTask = async (
  title: string,
  description: string,
  assignedTo: string,
  dueDate: string,
  priority: string,
  status: string = 'pending'
) => {
  try {
    const newTask = await databases.createDocument(
      DATABASE_ID,
      TASKS_COLLECTION_ID,
      ID.unique(),
      {
        title,
        description,
        assignedTo,
        dueDate,
        priority,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    
    return newTask;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  try {
    const updatedTask = await databases.updateDocument(
      DATABASE_ID,
      TASKS_COLLECTION_ID,
      taskId,
      {
        status,
        updatedAt: new Date().toISOString(),
      }
    );
    
    return updatedTask;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

export const getTasks = async (userId?: string, role?: string) => {
  try {
    // If role is admin, get all tasks
    // If role is employee, get only tasks assigned to this user
    const queries = [];
    
    if (role !== ROLE_ADMIN && userId) {
      queries.push(Query.equal('assignedTo', userId));
    }
    
    const tasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_COLLECTION_ID,
      queries
    );
    
    return tasks.documents;
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
};

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

export const recordAIUsage = async (userId: string, tokens: number) => {
  try {
    // Get the user document to check current token count
    const user = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    
    if (user.documents.length === 0) {
      throw new Error('User not found');
    }
    
    const currentUser = user.documents[0];
    
    // Admin has unlimited tokens
    if (currentUser.role === ROLE_ADMIN) {
      return { success: true, tokensRemaining: -1 };
    }
    
    // Check if user has enough tokens
    if (currentUser.aiTokensRemaining < tokens && currentUser.aiTokensRemaining !== -1) {
      return { success: false, tokensRemaining: currentUser.aiTokensRemaining };
    }
    
    // Update user's token count if not unlimited
    if (currentUser.aiTokensRemaining !== -1) {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        currentUser.$id,
        {
          aiTokensRemaining: currentUser.aiTokensRemaining - tokens
        }
      );
    }
    
    // Record AI usage
    await databases.createDocument(
      DATABASE_ID,
      AI_USAGE_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        tokensUsed: tokens,
        timestamp: new Date().toISOString(),
      }
    );
    
    return { 
      success: true, 
      tokensRemaining: currentUser.aiTokensRemaining !== -1 
        ? currentUser.aiTokensRemaining - tokens 
        : -1 
    };
  } catch (error) {
    console.error('Error recording AI usage:', error);
    throw error;
  }
};

export const updateAttendance = async (userId: string, date: string, status: string) => {
  try {
    // Check if an attendance record already exists for this user and date
    const existingRecords = await databases.listDocuments(
      DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('date', date)
      ]
    );
    
    if (existingRecords.documents.length > 0) {
      // Update existing record
      const updatedAttendance = await databases.updateDocument(
        DATABASE_ID,
        ATTENDANCE_COLLECTION_ID,
        existingRecords.documents[0].$id,
        {
          status,
          updatedAt: new Date().toISOString(),
        }
      );
      
      return updatedAttendance;
    } else {
      // Create new record
      const newAttendance = await databases.createDocument(
        DATABASE_ID,
        ATTENDANCE_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          date,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return newAttendance;
    }
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

export const getAttendance = async (userId?: string, startDate?: string, endDate?: string) => {
  try {
    let queries = [];
    
    if (userId) {
      queries.push(Query.equal('userId', userId));
    }
    
    if (startDate) {
      queries.push(Query.greaterThanEqual('date', startDate));
    }
    
    if (endDate) {
      queries.push(Query.lessThanEqual('date', endDate));
    }
    
    const attendance = await databases.listDocuments(
      DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      queries
    );
    
    return attendance.documents;
  } catch (error) {
    console.error('Error getting attendance:', error);
    throw error;
  }
};

export default client;
