
const express = require('express');
const { account } = require('../config/appwrite');
const { getUserByEmail, createUser } = require('../services/userService');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Create a session with Appwrite
    const session = await account.createEmailSession(email, password);
    
    // Get user details
    const user = await getUserByEmail(email);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      error: error.message
    });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Create user in Appwrite
    const user = await createUser(email, password, name, 'employee');
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // If no sessionId provided, delete all sessions
    if (!sessionId) {
      await account.deleteSessions();
    } else {
      await account.deleteSession(sessionId);
    }
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const user = await account.get();
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
      error: error.message
    });
  }
});

module.exports = router;
