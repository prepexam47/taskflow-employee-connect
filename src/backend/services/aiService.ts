
import { databases, DATABASE_ID, USERS_COLLECTION_ID, AI_USAGE_COLLECTION_ID, Query, ID } from '../config/appwrite';
import { toast } from '@/hooks/use-toast';

// Define configuration for AI services
interface AIServiceConfig {
  apiKey: string;
  model: string;
  endpoint: string;
  provider: 'openai' | 'groq' | 'anthropic';
}

// Default configuration - in production you'd store this securely
const defaultConfig: AIServiceConfig = {
  apiKey: '', // This would be stored in a secure environment variable
  model: 'gpt-4o-mini', // Default model
  endpoint: 'https://api.openai.com/v1/chat/completions',
  provider: 'openai',
};

// Get current AI service configuration
export const getAIConfig = async (): Promise<AIServiceConfig> => {
  try {
    // In a real app, you would fetch this from a secure source
    // For demo purposes, we'll use the default config
    return defaultConfig;
  } catch (error) {
    console.error('Error getting AI configuration:', error);
    return defaultConfig;
  }
};

// Check and update user token balance
export const checkTokenBalance = async (userId: string, tokensRequired: number): Promise<{
  success: boolean;
  tokensRemaining: number;
}> => {
  try {
    // Query the user document to check token count
    const userDocs = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    
    if (userDocs.documents.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userDocs.documents[0];
    
    // Admin has unlimited tokens (represented by -1)
    if (user.role === 'admin') {
      return { success: true, tokensRemaining: -1 };
    }
    
    // Check if user has enough tokens
    if (user.aiTokensRemaining < tokensRequired && user.aiTokensRemaining !== -1) {
      return { success: false, tokensRemaining: user.aiTokensRemaining };
    }
    
    // Update token balance if not unlimited
    if (user.aiTokensRemaining !== -1) {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
        {
          aiTokensRemaining: user.aiTokensRemaining - tokensRequired
        }
      );
      
      return {
        success: true,
        tokensRemaining: user.aiTokensRemaining - tokensRequired
      };
    }
    
    // If unlimited tokens
    return { success: true, tokensRemaining: -1 };
    
  } catch (error) {
    console.error('Error checking token balance:', error);
    throw error;
  }
};

// Update user's AI token allocation (admin only)
export const updateUserTokens = async (
  adminUserId: string,
  targetUserId: string,
  tokenAmount: number
): Promise<boolean> => {
  try {
    // Verify the user is an admin
    const adminDocs = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('userId', adminUserId)]
    );
    
    if (adminDocs.documents.length === 0 || adminDocs.documents[0].role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can update token allocations",
        variant: "destructive",
      });
      return false;
    }
    
    // Find the target user
    const userDocs = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('userId', targetUserId)]
    );
    
    if (userDocs.documents.length === 0) {
      toast({
        title: "User Not Found",
        description: "Could not find the specified user",
        variant: "destructive",
      });
      return false;
    }
    
    const user = userDocs.documents[0];
    
    // Update the token allocation
    await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      user.$id,
      {
        aiTokensRemaining: tokenAmount
      }
    );
    
    toast({
      title: "Tokens Updated",
      description: `Updated tokens for ${user.name} to ${tokenAmount}`,
    });
    
    return true;
    
  } catch (error) {
    console.error('Error updating user tokens:', error);
    toast({
      title: "Error",
      description: "Failed to update token allocation",
      variant: "destructive",
    });
    return false;
  }
};

// Send a request to the AI service
export const sendAIRequest = async (
  userId: string,
  prompt: string,
  estimatedTokens: number = 100
): Promise<{ success: boolean; response?: string; error?: string }> => {
  try {
    // Check token balance
    const tokenCheck = await checkTokenBalance(userId, estimatedTokens);
    if (!tokenCheck.success) {
      return { 
        success: false, 
        error: `Insufficient tokens. You have ${tokenCheck.tokensRemaining} tokens remaining.`
      };
    }
    
    // Get current AI configuration
    const config = await getAIConfig();
    
    // Make the API call to the selected AI service
    let response;
    
    switch(config.provider) {
      case 'openai':
        response = await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant for TaskFlow, providing concise and relevant information about task management, productivity, and workplace organization.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 500
          })
        });
        break;
        
      case 'anthropic':
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 500
          })
        });
        break;
        
      case 'groq':
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant for TaskFlow, providing concise and relevant information about task management, productivity, and workplace organization.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 500
          })
        });
        break;
        
      default:
        return { 
          success: false, 
          error: 'Invalid AI provider configuration'
        };
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI service error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    let aiResponse = '';
    
    // Parse response based on provider
    if (config.provider === 'openai' || config.provider === 'groq') {
      aiResponse = data.choices[0].message.content;
    } else if (config.provider === 'anthropic') {
      aiResponse = data.content[0].text;
    }
    
    // Record this usage
    await recordAIUsage(userId, estimatedTokens, prompt, aiResponse);
    
    return {
      success: true,
      response: aiResponse
    };
    
  } catch (error) {
    console.error('Error sending AI request:', error);
    return {
      success: false,
      error: `AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Record AI usage for tracking purposes
export const recordAIUsage = async (
  userId: string, 
  tokens: number, 
  prompt: string,
  response: string
) => {
  try {
    // Get the user document to check current token count
    const user = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    
    if (user.documents.length === 0) {
      throw new Error('User not found');
    }
    
    const currentUser = user.documents[0];
    
    // Admin has unlimited tokens
    if (currentUser.role === 'admin') {
      return { success: true, tokensRemaining: -1 };
    }
    
    // Check if user has enough tokens
    if (currentUser.aiTokensRemaining < tokens && currentUser.aiTokensRemaining !== -1) {
      return { success: false, tokensRemaining: currentUser.aiTokensRemaining };
    }
    
    // Update user's token count if not unlimited
    if (currentUser.aiTokensRemaining !== -1) {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        currentUser.$id,
        {
          aiTokensRemaining: currentUser.aiTokensRemaining - tokens
        }
      );
    }
    
    // Record AI usage with prompt and response
    await databases.createDocument(
      DATABASE_ID,
      AI_USAGE_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        tokensUsed: tokens,
        prompt: prompt,
        response: response,
        timestamp: new Date().toISOString(),
      }
    );
    
    return { 
      success: true, 
      tokensRemaining: currentUser.aiTokensRemaining !== -1 
        ? currentUser.aiTokensRemaining - tokens 
        : -1 
    };
  } catch (error) {
    console.error('Error recording AI usage:', error);
    throw error;
  }
};
