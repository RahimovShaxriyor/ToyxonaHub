import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/ui/Skeleton';

export function RoleRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="space-y-4 w-72 text-center">
          <Skeleton className="h-10 w-10 mx-auto rounded-full" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // If authenticated but unauthorized for this specific role, redirect to appropriate home
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'OWNER') {
      return <Navigate to="/owner/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleRoute;
