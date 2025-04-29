
import { Account, Client, Databases, Storage, ID, Query, Models } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('taskflow-employee-connect');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export Appwrite utilities for use in services
export { ID, Query, Models };

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

export default client;
