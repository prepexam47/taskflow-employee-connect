
const { Client, Account, Databases, Storage, Query } = require('node-appwrite');

// Init SDK
const client = new Client();

// If using local development, uncomment these and set your Appwrite details
// Typically, these would come from environment variables
/*
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('your-project-id')
    .setKey('your-api-key');
*/

// For production, use environment variables
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

// Service instances
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Database constants
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '';
const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID || '';
const TASKS_COLLECTION_ID = process.env.APPWRITE_TASKS_COLLECTION_ID || '';
const ATTENDANCE_COLLECTION_ID = process.env.APPWRITE_ATTENDANCE_COLLECTION_ID || '';
const MESSAGES_COLLECTION_ID = process.env.APPWRITE_MESSAGES_COLLECTION_ID || '';

module.exports = {
  client,
  account,
  databases,
  storage,
  Query,
  DATABASE_ID,
  USERS_COLLECTION_ID,
  TASKS_COLLECTION_ID,
  ATTENDANCE_COLLECTION_ID,
  MESSAGES_COLLECTION_ID
};
