import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, verifySession, handleAuthError, logout } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get initial session with enhanced error handling
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const session = await verifySession();
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          console.log('Initial session found for user:', session.user.email);
        } else {
          console.log('No initial session found');
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    getInitialSession();

    // Listen for auth changes with enhanced error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        
        try {
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              setSession(null);
              setUser(null);
            } else if (event === 'TOKEN_REFRESHED' && session) {
              console.log('Token refreshed successfully');
              setSession(session);
              setUser(session.user);
            }
          } else if (event === 'SIGNED_IN' && session) {
            console.log('User signed in:', session.user.email);
            setSession(session);
            setUser(session.user);
          } else if (event === 'USER_UPDATED' && session) {
            console.log('User updated');
            setSession(session);
            setUser(session.user);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          await handleAuthError();
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Refresh session function
  const refreshSession = async (): Promise<Session | null> => {
    try {
      console.log('Manually refreshing session...');
      const session = await verifySession();
      
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      
      return session;
    } catch (error) {
      console.error('Error manually refreshing session:', error);
      return null;
    }
  };
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in user:', email);
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log('Sign in successful');
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await logout();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    refreshSession,
  };

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};