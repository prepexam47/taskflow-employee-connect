
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { sendMessage, getMessages } from '@/utils/appwriteConfig';
import { toast } from '@/hooks/use-toast';

interface User {
  $id: string;
  name: string;
}

const ChatInterface = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // In a real app, you would fetch real users from your database
  useEffect(() => {
    // Mock users data
    setUsers([
      { $id: '1', name: 'John Doe' },
      { $id: '2', name: 'Jane Smith' },
      { $id: '3', name: 'Alex Johnson' },
    ]);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // In a real app, this would fetch real messages
      // For this demo, we'll set mock messages after a delay
      setTimeout(() => {
        const mockMessages = [
          { senderId: user.$id, receiverId: selectedUser, content: 'Hello there!', createdAt: new Date(Date.now() - 86400000).toISOString() },
          { senderId: selectedUser, receiverId: user.$id, content: 'Hi! How can I help you?', createdAt: new Date(Date.now() - 82800000).toISOString() },
          { senderId: user.$id, receiverId: selectedUser, content: 'I wanted to discuss the project timeline.', createdAt: new Date(Date.now() - 79200000).toISOString() },
          { senderId: selectedUser, receiverId: user.$id, content: 'Sure, I\'m available. What specifically did you want to discuss?', createdAt: new Date(Date.now() - 75600000).toISOString() },
        ];
        setMessages(mockMessages);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser || !user) return;

    try {
      // In a real app, this would send a real message to your backend
      // For this demo, we'll just add it to the local state
      const newMessage = {
        senderId: user.$id,
        receiverId: selectedUser,
        content: messageInput,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');

      // Simulate response after a delay
      setTimeout(() => {
        const responseMessage = {
          senderId: selectedUser,
          receiverId: user.$id,
          content: 'Thanks for your message. I\'ll get back to you soon!',
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="mb-4">
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger>
            <SelectValue placeholder="Select a user to chat with" />
          </SelectTrigger>
          <SelectContent>
            {users.map(u => (
              <SelectItem key={u.$id} value={u.$id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedUser ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-md mb-4">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length > 0 ? (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex mb-4 ${message.senderId === user?.$id ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-[75%] ${message.senderId === user?.$id ? 'bg-primary text-white' : 'bg-white'}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {message.senderId !== user?.$id && (
                          <Avatar className="h-8 w-8 bg-secondary">
                            <div className="text-xs font-bold">{users.find(u => u.$id === message.senderId)?.name.charAt(0) || 'U'}</div>
                          </Avatar>
                        )}
                        <div>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{formatTime(message.createdAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
              Send
            </Button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-md">
          <p className="text-muted-foreground">Select a user to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
