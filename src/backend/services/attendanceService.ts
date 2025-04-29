
import { databases, DATABASE_ID, ATTENDANCE_COLLECTION_ID, Query, ID } from '../config/appwrite';

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
