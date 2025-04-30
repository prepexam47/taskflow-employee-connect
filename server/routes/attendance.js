
const express = require('express');
const { clockIn, clockOut, getUserAttendance } = require('../services/attendanceService');

const router = express.Router();

// Clock in
router.post('/clock-in', async (req, res) => {
  try {
    const { userId } = req.body;
    const attendance = await clockIn(userId);
    
    res.status(201).json({
      success: true,
      message: 'Clocked in successfully',
      attendance
    });
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({
      success: false,
      message: 'Error clocking in',
      error: error.message
    });
  }
});

// Clock out
router.post('/clock-out', async (req, res) => {
  try {
    const { userId } = req.body;
    const attendance = await clockOut(userId);
    
    res.status(200).json({
      success: true,
      message: 'Clocked out successfully',
      attendance
    });
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({
      success: false,
      message: 'Error clocking out',
      error: error.message
    });
  }
});

// Get user attendance records
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const attendance = await getUserAttendance(userId, startDate, endDate);
    
    res.status(200).json({
      success: true,
      attendance
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
});

module.exports = router;
