
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { updateAttendance, getAttendance, ROLE_ADMIN } from '@/utils/appwriteConfig';
import { toast } from '@/hooks/use-toast';

interface User {
  $id: string;
  name: string;
}

const AttendanceTracker = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === ROLE_ADMIN;

  // In a real app, you would fetch real users from your database
  useEffect(() => {
    // Mock users data
    const mockUsers = [
      { $id: '1', name: 'John Doe' },
      { $id: '2', name: 'Jane Smith' },
      { $id: '3', name: 'Alex Johnson' },
    ];
    
    setUsers(mockUsers);
    
    // If not admin, set selectedUser to current user
    if (!isAdmin && user) {
      setSelectedUser(user.$id);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (selectedUser) {
      fetchAttendance();
    }
  }, [selectedUser, date]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch real attendance data
      // For this demo, we'll set mock attendance after a delay
      setTimeout(() => {
        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        const mockAttendance = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(currentYear, currentMonth, day);
          
          // Skip future dates
          if (currentDate > new Date()) continue;
          
          // Randomly assign attendance status
          let status;
          const random = Math.random();
          
          if (random < 0.7) {
            status = 'present';
          } else if (random < 0.85) {
            status = 'absent';
          } else {
            status = 'half-day';
          }
          
          mockAttendance.push({
            userId: selectedUser,
            date: format(currentDate, 'yyyy-MM-dd'),
            status,
          });
        }
        
        setAttendance(mockAttendance);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (date: string, status: string) => {
    if (!isAdmin || !selectedUser) return;

    try {
      // In a real app, this would update real attendance data
      // For this demo, we'll just update the local state
      setAttendance(prev => 
        prev.map(item => 
          item.date === date ? { ...item, status } : item
        )
      );
      
      toast({
        title: "Attendance Updated",
        description: `Attendance for ${format(parseISO(date), 'MMM dd, yyyy')} updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600';
      case 'absent':
        return 'text-red-600';
      case 'half-day':
        return 'text-yellow-600';
      default:
        return '';
    }
  };

  const currentMonthName = format(date, 'MMMM yyyy');

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Attendance Tracker</h2>
        
        <div className="flex flex-wrap items-center gap-4">
          {isAdmin && (
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.$id} value={u.$id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <div className="relative">
            <Button variant="outline" onClick={() => setDate(new Date())}>
              {currentMonthName}
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : selectedUser ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead>Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <TableRow key={record.date}>
                    <TableCell>{format(parseISO(record.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(parseISO(record.date), 'EEEE')}</TableCell>
                    <TableCell className={getStatusColor(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Select
                          value={record.status}
                          onValueChange={(value) => handleUpdateAttendance(record.date, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="half-day">Half Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-4">
                    No attendance records found for this month
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Select an employee to view attendance</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;
