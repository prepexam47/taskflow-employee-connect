
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/frontend/context/AuthContext';
import { Calendar, MessageSquare, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_ADMIN } from '@/utils/appwriteConfig';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLE_ADMIN;

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Users className="h-5 w-5" />,
      show: true,
    },
    {
      title: 'Tasks',
      href: '/tasks',
      icon: <Calendar className="h-5 w-5" />,
      show: true,
    },
    {
      title: 'AI Assistant',
      href: '/ai',
      icon: <User className="h-5 w-5" />,
      show: true,
    },
    {
      title: 'Chat',
      href: '/chat',
      icon: <MessageSquare className="h-5 w-5" />,
      show: true,
    },
    {
      title: 'Attendance',
      href: '/attendance',
      icon: <Calendar className="h-5 w-5" />,
      show: true,
    },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground min-h-screen p-4">
      <div className="mb-8 flex items-center justify-center">
        <h1 className="text-2xl font-bold">TaskFlow</h1>
      </div>
      
      <nav className="space-y-2">
        {navItems
          .filter(item => item.show)
          .map(item => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground'
                )
              }
            >
              {item.icon}
              <span>{item.title}</span>
            </NavLink>
          ))}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-sidebar-accent rounded-md p-3 text-sm">
          <p className="font-medium">Logged in as:</p>
          <p>{user?.name}</p>
          <p className="text-xs opacity-70">{user?.role}</p>
          {user?.role !== ROLE_ADMIN && (
            <div className="mt-2 pt-2 border-t border-sidebar-border">
              <p className="text-xs">
                AI Tokens: {user?.aiTokensRemaining === -1 ? 'Unlimited' : user?.aiTokensRemaining}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
