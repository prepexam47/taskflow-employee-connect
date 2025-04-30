
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./components/layout/Dashboard";
import DashboardPage from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import AIAssistant from "./pages/AIAssistant";
import Chat from "./pages/Chat";
import Attendance from "./pages/Attendance";
import NotFound from "./pages/NotFound";
import { useAuth } from "./frontend/context/AuthContext";
import Index from "./pages/Index";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="chat" element={<Chat />} />
        <Route path="attendance" element={<Attendance />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
