
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatInterface from '@/components/chat/ChatInterface';
import { useAuth } from '@/context/AuthContext';

const Chat = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Team Chat</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {user && <ChatInterface currentUser={user} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
