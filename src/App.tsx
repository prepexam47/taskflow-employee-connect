
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./components/layout/Dashboard";
import DashboardPage from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import AIAssistant from "./pages/AIAssistant";
import Chat from "./pages/Chat";
import Attendance from "./pages/Attendance";
import NotFound from "./pages/NotFound";

// Install Appwrite
<lov-add-dependency>appwrite@13.0.0</lov-add-dependency>

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // In a real app, this would check for authentication
  // For demo purposes, we'll assume the user is authenticated
  const isAuthenticated = true;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
