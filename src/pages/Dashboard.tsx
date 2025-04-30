
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/frontend/context/AuthContext';
import { ROLE_ADMIN } from '@/utils/appwriteConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLE_ADMIN;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTask: 0,
  });
  const [taskData, setTaskData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, fetch real data from your backend
    // For this demo, we'll use mock data
    setTimeout(() => {
      setStats({
        totalTasks: 24,
        completedTasks: 16,
        pendingTasks: 6,
        overdueTask: 2,
      });

      setTaskData([
        { name: 'Monday', completed: 4, pending: 2 },
        { name: 'Tuesday', completed: 3, pending: 1 },
        { name: 'Wednesday', completed: 5, pending: 0 },
        { name: 'Thursday', completed: 2, pending: 3 },
        { name: 'Friday', completed: 2, pending: 0 },
      ]);

      setAttendanceData([
        { name: 'Week 1', present: 90, absent: 5, halfDay: 5 },
        { name: 'Week 2', present: 85, absent: 10, halfDay: 5 },
        { name: 'Week 3', present: 95, absent: 5, halfDay: 0 },
        { name: 'Week 4', present: 80, absent: 15, halfDay: 5 },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6">
          {isAdmin ? 'Company Dashboard' : 'Personal Dashboard'}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTasks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pendingTasks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.overdueTask}</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>Daily task status for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taskData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#4ade80" name="Completed" />
                  <Bar dataKey="pending" fill="#facc15" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Team attendance summary by week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="present" fill="#4ade80" name="Present" stackId="a" />
                    <Bar dataKey="halfDay" fill="#facc15" name="Half Day" stackId="a" />
                    <Bar dataKey="absent" fill="#f87171" name="Absent" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>Your latest activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/20 p-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <p className="font-medium">Task completed: Website redesign</p>
                  <p className="text-sm text-muted-foreground">Yesterday at 2:30 PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/20 p-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <p className="font-medium">New task assigned: Q4 Report</p>
                  <p className="text-sm text-muted-foreground">Today at 9:15 AM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/20 p-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <p className="font-medium">Meeting scheduled: Project review</p>
                  <p className="text-sm text-muted-foreground">Tomorrow at 10:00 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
