import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [, navigate] = useLocation();
  const { user, isAdmin, isLoading } = useAuth();

  // Add console logs to debug
  console.log("AdminProtectedRoute:", { user, isAdmin, isLoading });

  useEffect(() => {
    // Add debug logs inside the effect
    console.log("AdminProtectedRoute effect:", { user, isAdmin, isLoading });
    
    // Wait until authentication check is complete
    if (!isLoading) {
      // If user is not logged in or not an admin, redirect to home
      if (!user || !isAdmin) {
        console.log("Redirecting to home - not admin or not logged in");
        navigate('/', { replace: true });
      } else {
        console.log("Admin check passed, should show admin page");
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  // While checking auth status, show nothing
  if (isLoading) {
    return <div className="p-8 text-center">Loading authentication status...</div>;
  }

  // If we're still here and the user isn't an admin, show a message
  if (!user || !isAdmin) {
    return <div className="p-8 text-center">You must be an admin to view this page.</div>;
  }

  // Only render children if user is an admin
  return <>{children}</>;
}