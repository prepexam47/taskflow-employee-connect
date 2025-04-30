
# TaskFlow API Server

This is the backend API server for the TaskFlow application. It communicates with Appwrite services using node-appwrite.

## Setup

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_USERS_COLLECTION_ID=your-users-collection-id
APPWRITE_TASKS_COLLECTION_ID=your-tasks-collection-id
APPWRITE_ATTENDANCE_COLLECTION_ID=your-attendance-collection-id
APPWRITE_MESSAGES_COLLECTION_ID=your-messages-collection-id
```

3. Start the server:
```
npm start
```

For development with auto-restart:
```
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - Login with email and password
- POST `/api/auth/signup` - Register a new user
- POST `/api/auth/logout` - Logout current user
- GET `/api/auth/me` - Get current authenticated user

### Users
- GET `/api/users` - Get all users (admin only)
- GET `/api/users/:email` - Get user by email
- PATCH `/api/users/:userId/role` - Update user role (admin only)

### Tasks
- POST `/api/tasks` - Create a new task
- GET `/api/tasks/user/:userId` - Get tasks for a user
- PATCH `/api/tasks/:taskId/status` - Update task status
- DELETE `/api/tasks/:taskId` - Delete a task

### Attendance
- POST `/api/attendance/clock-in` - Clock in
- POST `/api/attendance/clock-out` - Clock out
- GET `/api/attendance/user/:userId` - Get user attendance records

### Messages
- POST `/api/messages` - Send a message
- GET `/api/messages/conversation` - Get conversation between two users
- GET `/api/messages/user/:userId` - Get all conversations for a user
