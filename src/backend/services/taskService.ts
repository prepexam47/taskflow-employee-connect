
import { databases, DATABASE_ID, TASKS_COLLECTION_ID, Query, ID } from '../config/appwrite';
import { ROLE_ADMIN } from '../config/appwrite';

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
