
import React, { useState } from 'react';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { ROLE_ADMIN } from '@/utils/appwriteConfig';

const Tasks = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isAdmin = user?.role === ROLE_ADMIN;

  // In a real app, you would fetch users from your database
  // For this demo, we'll use mock users
  const users = [
    { $id: '1', name: 'John Doe' },
    { $id: '2', name: 'Jane Smith' },
    { $id: '3', name: 'Alex Johnson' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Tasks</h2>
        {isAdmin && (
          <Button onClick={() => setIsFormOpen(true)}>
            Create New Task
          </Button>
        )}
      </div>

      <TaskList />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSuccess={() => {
              setIsFormOpen(false);
            }}
            users={users}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
