
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format } from 'date-fns';
import { updateTaskStatus } from '@/utils/appwriteConfig';
import { toast } from '@/hooks/use-toast';

interface TaskCardProps {
  task: {
    $id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status: string;
    assignedToName?: string;
  };
  isAdmin: boolean;
  onStatusChange: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isAdmin, onStatusChange }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTaskStatus(task.$id, newStatus);
      toast({
        title: "Status Updated",
        description: `Task status changed to ${newStatus}`,
      });
      onStatusChange();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update task status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {task.assignedToName && `Assigned to: ${task.assignedToName}`}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{task.description}</p>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Due: {formatDate(task.dueDate)}</div>
          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <Select
            defaultValue={task.status}
            onValueChange={handleStatusChange}
            disabled={!isAdmin && task.status === 'completed'}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              {isAdmin && <SelectItem value="canceled">Canceled</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
