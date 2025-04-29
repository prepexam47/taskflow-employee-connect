
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { recordAIUsage, ROLE_ADMIN } from '@/utils/appwriteConfig';
import { toast } from '@/hooks/use-toast';

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'system', content: 'Hello! I am your TaskFlow AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === ROLE_ADMIN;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // In a real app, check tokens and call the AI service
      // For this demo, we'll simulate token usage and response
      if (user) {
        const estimatedTokens = Math.ceil(input.length / 4);
        const tokenCheck = await recordAIUsage(user.$id, estimatedTokens);

        if (!tokenCheck.success) {
          toast({
            title: "Token Limit Reached",
            description: "You don't have enough tokens left for this request",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Simulate AI response
        setTimeout(() => {
          // Generate a mock response based on the input
          let aiResponse = '';
          if (input.toLowerCase().includes('task')) {
            aiResponse = "I can help you manage tasks! You can create, update, or view your tasks through the Tasks section.";
          } else if (input.toLowerCase().includes('deadline') || input.toLowerCase().includes('due date')) {
            aiResponse = "Need help with deadlines? I recommend setting clear due dates when creating tasks and using the priority field to highlight urgency.";
          } else if (input.toLowerCase().includes('report') || input.toLowerCase().includes('summary')) {
            aiResponse = "I can provide task summaries and reports! In a real implementation, I could generate detailed performance analytics and task completion statistics.";
          } else {
            aiResponse = "Thank you for your query. I'm here to help with task management, deadlines, workflows, and providing insights on productivity. How else can I assist you today?";
          }
          
          setMessages(prev => [...prev, { role: 'system', content: aiResponse }]);
          setLoading(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error with AI request:', error);
      toast({
        title: "AI Error",
        description: "There was a problem processing your request",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-md mb-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-[75%] ${message.role === 'user' ? 'bg-primary text-white' : 'bg-white'}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {message.role !== 'user' && (
                    <Avatar className="h-8 w-8 bg-primary text-white">
                      <div className="text-xs font-bold">AI</div>
                    </Avatar>
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI assistant..."
          className="flex-1 resize-none"
          disabled={loading || (!isAdmin && user?.aiTokensRemaining === 0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={loading || !input.trim() || (!isAdmin && user?.aiTokensRemaining === 0)}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : 'Send'}
        </Button>
      </div>
      
      {!isAdmin && (
        <div className="text-xs text-muted-foreground mt-2">
          Tokens remaining: {user?.aiTokensRemaining === -1 ? 'Unlimited' : user?.aiTokensRemaining}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
