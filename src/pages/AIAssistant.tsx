
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AIAssistant from '@/components/ai/AIAssistant';
import TokenAllocationManager from '@/components/admin/TokenAllocationManager';
import { useAuth } from '@/context/AuthContext';
import { ROLE_ADMIN } from '@/utils/appwriteConfig';

const AIAssistantPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLE_ADMIN;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">AI Assistant</h2>

      <div className="grid grid-cols-1 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>TaskFlow AI</CardTitle>
            <CardDescription>
              Get help with task management, reports, and productivity questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AIAssistant />
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <div className="mt-8">
          <TokenAllocationManager />
        </div>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>About TaskFlow AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              TaskFlow AI is your intelligent assistant for improving productivity and task management.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">What TaskFlow AI can help with:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Task prioritization advice</li>
                  <li>Deadline management tips</li>
                  <li>Report summaries and insights</li>
                  <li>Productivity improvement suggestions</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Token System:</h4>
                <p className="text-sm">
                  {isAdmin 
                    ? "As an administrator, you have unlimited access to the AI assistant and can assign token allocations to employees." 
                    : `Each employee is allocated a daily token limit for AI usage. You currently have ${user?.aiTokensRemaining === -1 ? 'unlimited' : user?.aiTokensRemaining} tokens remaining.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistantPage;
