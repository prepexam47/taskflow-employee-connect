
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
import { sendMessage, getMessages, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/utils/appwriteConfig';
import { toast } from '@/hooks/use-toast';
import { ID, Query } from 'appwrite';

interface User {
  $id: string;
  userId: string;
  name: string;
  email: string;
  role?: string;
  aiTokensRemaining?: number;
}

interface Message {
  $id: string;
  senderId: string;
  receiverId: string;
  content: string;
  readStatus: boolean;
  createdAt: string;
}

interface ChatInterfaceProps {
  currentUser: User;
}

interface AppwriteDocument {
  $id: string;
  [key: string]: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch users from Appwrite
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          []
        );

        // Filter out current user and properly cast the documents to User type
        const otherUsers = response.documents
          .filter((user: AppwriteDocument) => user.userId !== currentUser.userId)
          .map((user: AppwriteDocument) => user as unknown as User);
        
        setUsers(otherUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

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
    if (!currentUser || !selectedUser) return;
    
    setLoading(true);
    try {
      // In a real app, we would get messages between two users
      // Here we're using a simplified approach
      const sentMessages = await databases.listDocuments(
        DATABASE_ID,
        'messages',
        [
          Query.equal('senderId', currentUser.userId),
          Query.equal('receiverId', selectedUser)
        ]
      );

      const receivedMessages = await databases.listDocuments(
        DATABASE_ID,
        'messages',
        [
          Query.equal('senderId', selectedUser),
          Query.equal('receiverId', currentUser.userId)
        ]
      );

      // Combine and sort messages by timestamp
      const allMessages = [
        ...sentMessages.documents,
        ...receivedMessages.documents
      ]
        .sort((a: AppwriteDocument, b: AppwriteDocument) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
        .map((msg: AppwriteDocument) => msg as unknown as Message);

      setMessages(allMessages);
      setLoading(false);
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
    if (!messageInput.trim() || !selectedUser || !currentUser) return;

    try {
      // Create message document
      const newMessage = await databases.createDocument(
        DATABASE_ID,
        'messages',
        ID.unique(),
        {
          senderId: currentUser.userId,
          receiverId: selectedUser,
          content: messageInput,
          readStatus: false,
          createdAt: new Date().toISOString(),
        }
      );
      
      // Add to local state
      setMessages(prev => [...prev, newMessage as unknown as Message]);
      setMessageInput('');
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

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.userId === userId);
    return user ? user.name : 'Unknown User';
  };

  // Get first letter of name for avatar
  const getInitial = (userId: string) => {
    const name = getUserName(userId);
    return name.charAt(0).toUpperCase();
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
              <SelectItem key={u.userId} value={u.userId}>{u.name}</SelectItem>
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
                  className={`flex mb-4 ${message.senderId === currentUser?.userId ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-[75%] ${message.senderId === currentUser?.userId ? 'bg-primary text-white' : 'bg-white'}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {message.senderId !== currentUser?.userId && (
                          <Avatar className="h-8 w-8 bg-secondary">
                            <div className="text-xs font-bold">{getInitial(message.senderId)}</div>
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
