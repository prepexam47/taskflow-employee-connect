
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { ROLE_ADMIN } from '@/utils/appwriteConfig';
import { sendAIRequest } from '@/utils/aiService';
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
    if (!input.trim() || !user) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Estimate token usage (simple estimate based on input length)
      const estimatedTokens = Math.ceil(input.length / 4);
      
      // Send request to AI service
      const aiResponse = await sendAIRequest(user.$id, input, estimatedTokens);
      
      if (!aiResponse.success) {
        toast({
          title: "AI Error",
          description: aiResponse.error || "Failed to get AI response",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Add AI response to messages
      setMessages(prev => [
        ...prev, 
        { role: 'system', content: aiResponse.response || "Sorry, I couldn't process your request." }
      ]);
    } catch (error) {
      console.error('Error with AI request:', error);
      toast({
        title: "AI Error",
        description: "There was a problem processing your request",
        variant: "destructive",
      });
    } finally {
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
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
