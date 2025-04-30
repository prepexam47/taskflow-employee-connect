
const { databases, DATABASE_ID, TASKS_COLLECTION_ID, Query } = require('../config/appwrite');
const { ID } = require('node-appwrite');

// Create a new task
const createTask = async (title, description, dueDate, assignedTo) => {
  try {
    const taskData = {
      title,
      description,
      dueDate,
      assignedTo,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const task = await databases.createDocument(
      DATABASE_ID,
      TASKS_COLLECTION_ID,
      ID.unique(),
      taskData
    );
    
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Get tasks for a specific user
const getUserTasks = async (userId) => {
  try {
    const tasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_COLLECTION_ID,
      [Query.equal('assignedTo', userId)]
    );
    
    return tasks.documents;
  } catch (error) {
    console.error('Error getting user tasks:', error);
    throw error;
  }
};

// Update task status
const updateTaskStatus = async (taskId, status) => {
  try {
    const task = await databases.updateDocument(
      DATABASE_ID,
      TASKS_COLLECTION_ID,
      taskId,
      { status }
    );
    
    return task;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

// Delete a task
const deleteTask = async (taskId) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      TASKS_COLLECTION_ID,
      taskId
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

module.exports = {
  createTask,
  getUserTasks,
  updateTaskStatus,
  deleteTask
};
