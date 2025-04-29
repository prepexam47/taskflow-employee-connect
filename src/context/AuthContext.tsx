
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, databases, getUserByEmail, DATABASE_ID, USERS_COLLECTION_ID } from '../utils/appwriteConfig';
import { toast } from '@/hooks/use-toast';

interface User {
  $id: string;
  name: string;
  email: string;
  role: string;
  aiTokensRemaining: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      setLoading(true);
      const session = await account.getSession('current');
      
      if (session) {
        const accountDetails = await account.get();
        const userDetails = await getUserByEmail(accountDetails.email);
        
        if (userDetails) {
          setUser({
            $id: userDetails.$id,
            name: userDetails.name,
            email: userDetails.email,
            role: userDetails.role,
            aiTokensRemaining: userDetails.aiTokensRemaining
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await account.createEmailSession(email, password);
      const success = await checkAuth();
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await account.deleteSession('current');
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
