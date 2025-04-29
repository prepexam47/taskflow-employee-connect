
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatInterface from '@/components/chat/ChatInterface';

const Chat = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Team Chat</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
