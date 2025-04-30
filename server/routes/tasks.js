
const express = require('express');
const { createTask, getUserTasks, updateTaskStatus, deleteTask } = require('../services/taskService');

const router = express.Router();

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo } = req.body;
    const task = await createTask(title, description, dueDate, assignedTo);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
});

// Get tasks for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await getUserTasks(userId);
    
    res.status(200).json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
});

// Update task status
router.patch('/:taskId/status', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    
    const task = await updateTaskStatus(taskId, status);
    
    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message
    });
  }
});

// Delete a task
router.delete('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    await deleteTask(taskId);
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

module.exports = router;
