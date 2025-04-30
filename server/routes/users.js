
const express = require('express');
const { getUserByEmail, getAllUsers, updateUserRole } = require('../services/userService');

const router = express.Router();

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get user by email
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// Update user role (admin only)
router.patch('/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['admin', 'employee'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role provided'
      });
    }
    
    const user = await updateUserRole(userId, role);
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
});

module.exports = router;
