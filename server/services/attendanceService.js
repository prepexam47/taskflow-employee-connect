
const { databases, DATABASE_ID, ATTENDANCE_COLLECTION_ID, Query } = require('../config/appwrite');
const { ID } = require('node-appwrite');

// Clock in
const clockIn = async (userId) => {
  try {
    // Check if user is already clocked in today
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await databases.listDocuments(
      DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.greaterThanEqual('clockInTime', today)
      ]
    );
    
    if (existingAttendance.documents.length > 0 && !existingAttendance.documents[0].clockOutTime) {
      throw new Error('User is already clocked in');
    }
    
    const attendanceData = {
      userId,
      clockInTime: new Date().toISOString(),
      clockOutTime: null
    };
    
    const attendance = await databases.createDocument(
      DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      ID.unique(),
      attendanceData
    );
    
    return attendance;
  } catch (error) {
    console.error('Error clocking in:', error);
    throw error;
  }
};

// Clock out
const clockOut = async (userId) => {
  try {
    // Find the most recent clock-in record without a clock-out time
    const attendance = await databases.listDocuments(
      DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.isNull('clockOutTime')
      ]
    );
    
    if (attendance.documents.length === 0) {
      throw new Error('No active clock-in found');
    }
    
    const currentAttendance = attendance.documents[0];
    
    const updatedAttendance = await databases.updateDocument(
      DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      currentAttendance.$id,
      { clockOutTime: new Date().toISOString() }
    );
    
    return updatedAttendance;
  } catch (error) {
    console.error('Error clocking out:', error);
    throw error;
  }
};

// Get user attendance records
const getUserAttendance = async (userId, startDate, endDate) => {
  try {
    let queries = [Query.equal('userId', userId)];
    
    if (startDate) {
      queries.push(Query.greaterThanEqual('clockInTime', startDate));
    }
    
    if (endDate) {
      queries.push(Query.lessThanEqual('clockInTime', endDate));
    }
    
    const attendance = await databases.listDocuments(
      DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      queries
    );
    
    return attendance.documents;
  } catch (error) {
    console.error('Error getting user attendance:', error);
    throw error;
  }
};

module.exports = {
  clockIn,
  clockOut,
  getUserAttendance
};
