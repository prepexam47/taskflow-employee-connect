
import React, { useEffect, useState } from 'react';
import { getTasks, ROLE_ADMIN } from '@/utils/appwriteConfig';
import { useAuth } from '@/context/AuthContext';
import TaskCard from './TaskCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface User {
  $id: string;
  name: string;
}

const TaskList = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('all');
  const isAdmin = user?.role === ROLE_ADMIN;

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await getTasks(
        user?.$id,
        user?.role
      );
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // In a real app, you would fetch users here as well
    // For now, we'll mock this data
    setUsers([
      { $id: '1', name: 'John Doe' },
      { $id: '2', name: 'Jane Smith' },
      { $id: '3', name: 'Alex Johnson' },
    ]);
  }, []);

  const filteredTasks = tasks.filter(task => {
    let statusMatch = filter === 'all' || task.status === filter;
    let userMatch = selectedUser === 'all' || task.assignedTo === selectedUser;
    return statusMatch && userMatch;
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Tasks</h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          
          {isAdmin && (
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.$id} value={u.$id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="task-grid">
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.$id} 
              task={task} 
              isAdmin={isAdmin} 
              onStatusChange={fetchTasks}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tasks found</p>
          {isAdmin && (
            <Button className="mt-4">Create Task</Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
