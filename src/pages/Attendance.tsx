
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttendanceTracker from '@/components/attendance/AttendanceTracker';
import { useAuth } from '@/frontend/context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Attendance</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Tracker</CardTitle>
          <CardDescription>
            {user?.role === 'admin'
              ? 'View and manage attendance records for all employees'
              : 'View your attendance record'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceTracker />
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
