
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/utils/appwriteConfig';
import { updateUserTokens } from '@/utils/aiService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface User {
  $id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  aiTokensRemaining: number;
}

const TokenAllocationManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenUpdates, setTokenUpdates] = useState<Record<string, number>>({});
  const { user: currentUser } = useAuth();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        []
      );
      
      // Filter out current admin user
      const filteredUsers = response.documents.filter(
        (u: any) => u.userId !== currentUser?.$id && u.role !== 'admin'
      ) as User[];
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleTokenChange = (userId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setTokenUpdates({
      ...tokenUpdates,
      [userId]: numValue
    });
  };

  const handleUpdateTokens = async (userId: string) => {
    if (!currentUser) return;
    
    const newTokenAmount = tokenUpdates[userId];
    if (newTokenAmount === undefined) return;
    
    const success = await updateUserTokens(
      currentUser.$id,
      userId,
      newTokenAmount
    );
    
    if (success) {
      // Update local state
      setUsers(users.map(u => {
        if (u.userId === userId) {
          return { ...u, aiTokensRemaining: newTokenAmount };
        }
        return u;
      }));
      
      // Clear the update
      const updatedTokens = { ...tokenUpdates };
      delete updatedTokens[userId];
      setTokenUpdates(updatedTokens);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Token Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Tokens</TableHead>
                <TableHead>New Allocation</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.$id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.aiTokensRemaining === -1 ? "Unlimited" : user.aiTokensRemaining}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={tokenUpdates[user.userId] ?? ''}
                        onChange={(e) => handleTokenChange(user.userId, e.target.value)}
                        placeholder="New token amount"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => handleUpdateTokens(user.userId)}
                        disabled={tokenUpdates[user.userId] === undefined}
                        size="sm"
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenAllocationManager;
