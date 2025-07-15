import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verifySession } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, refreshSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;
      
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
      
      // Verify session is still valid
      try {
        const session = await verifySession();
        if (!session) {
          console.log('Session verification failed, redirecting to login');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error verifying session in ProtectedRoute:', error);
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
  }, [user, loading, navigate]);

  // Additional session check on component mount and periodically
  useEffect(() => {
    if (!user || loading) return;

    // Check session every 5 minutes
    const interval = setInterval(async () => {
      try {
        console.log('Periodic session check...');
        const session = await refreshSession();
        if (!session) {
          console.log('Periodic session check failed, redirecting to login');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error during periodic session check:', error);
        navigate('/login', { replace: true });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, loading, navigate, refreshSession]);

  // Handle page visibility change to check session when user returns
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user && !loading) {
        try {
          console.log('Page became visible, checking session...');
          const session = await verifySession();
          if (!session) {
            console.log('Session invalid after page became visible, redirecting to login');
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('Error checking session on visibility change:', error);
          navigate('/login', { replace: true });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, loading, navigate]);

  // Handle storage events (e.g., user logs out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase.auth.token' && !e.newValue) {
        console.log('Auth token removed from storage, redirecting to login');
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  // Enhanced loading check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Enhanced user check
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
    }

  return <>{children}</>;
};

export default ProtectedRoute;