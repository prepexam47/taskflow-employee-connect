
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Instead of using useEffect and navigate which can cause issues,
  // we'll use the Navigate component for a more reliable redirect
  return <Navigate to="/login" replace />;
};

export default Index;
