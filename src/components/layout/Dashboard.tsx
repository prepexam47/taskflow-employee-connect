
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/frontend/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 bg-sidebar">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-16 w-full" />
          <div className="p-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
