
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">TaskFlow</CardTitle>
          <CardDescription>Employee Task and HR Management</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Button variant="link" className="p-0" asChild>
              <Link to="/signup">Create one</Link>
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            TaskFlow helps you manage tasks, track attendance, and connect with your team.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
