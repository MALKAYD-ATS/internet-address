import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Helper function to verify active session
export const verifySession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      await handleAuthError();
      return null;
    }
    
    if (!session) {
      console.warn('No valid session found');
      return null;
    }
    
    // Check if session is expired or about to expire (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    
    if (expiresAt - now < 300) { // Less than 5 minutes remaining
      console.log('Session expiring soon, attempting refresh...');
      return await refreshSessionSafely();
    }
    
    return session;
  } catch (error) {
    console.error('Unexpected error verifying session:', error);
    await handleAuthError();
    return null;
  }
};

// Helper function to safely refresh session
export const refreshSessionSafely = async () => {
  try {
    const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      await handleAuthError();
      return null;
    }
    
    if (!refreshedSession) {
      console.warn('No session returned after refresh');
      await handleAuthError();
      return null;
    }
    
    console.log('Session refreshed successfully');
    return refreshedSession;
  } catch (error) {
    console.error('Unexpected error refreshing session:', error);
    await handleAuthError();
    return null;
  }
};

// Helper function to handle authentication errors
export const handleAuthError = async () => {
  try {
    console.log('Handling auth error: clearing session and redirecting to login');
    await supabase.auth.signOut();
    localStorage.clear();
    
    // Only redirect if not already on login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error during auth error handling:', error);
    // Force redirect even if signOut fails
    localStorage.clear();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
};

// Enhanced logout function
export const logout = async () => {
  try {
    console.log('Logging out user...');
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear(); // Clear session storage as well
    window.location.href = '/login';
  } catch (error) {
    console.error('Error during logout:', error);
    // Force logout even if signOut fails
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }
};

export type Database = {
  public: {
    Tables: {
      registrations: {
        Row: {
          id: number
          created_at: string
          name: string
          email: string
          phone: string
          course: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          email: string
          phone: string
          course: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          email?: string
          phone?: string
          course?: string
        }
      }
      students: {
        Row: {
          id: string
          full_name: string
          phone_number: string
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone_number?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone_number?: string
          created_at?: string
        }
      }
      courses_ats: {
        Row: {
          id: string
          created_at: string
          title: string | null
          type: string | null
          description: string | null
          level: string | null
          age_requirement: number | null
          experience_requirement: string | null
          equipment_requirement: string | null
          document_requirement: string | null
          suggested_preparation: string | null
          price: number | null
          currency: string | null
          duration: string | null
          max_students: number | null
          start_date: string | null
          whats_included: any
          is_active: boolean | null
          is_online: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          title?: string | null
          type?: string | null
          description?: string | null
          level?: string | null
          age_requirement?: number | null
          experience_requirement?: string | null
          equipment_requirement?: string | null
          document_requirement?: string | null
          suggested_preparation?: string | null
          price?: number | null
          currency?: string | null
          duration?: string | null
          max_students?: number | null
          start_date?: string | null
          whats_included?: any
          is_active?: boolean | null
          is_online?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string | null
          type?: string | null
          description?: string | null
          level?: string | null
          age_requirement?: number | null
          experience_requirement?: string | null
          equipment_requirement?: string | null
          document_requirement?: string | null
          suggested_preparation?: string | null
          price?: number | null
          currency?: string | null
          duration?: string | null
          max_students?: number | null
          start_date?: string | null
          whats_included?: any
          is_active?: boolean | null
          is_online?: boolean | null
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrolled_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          enrolled_at?: string
        }
      }
    }
  }
  ats_course_modules: {
    Row: {
      id: string
      course_id: string
      title: string
      description: string | null
      order: number
      created_at: string
    }
    Insert: {
      id?: string
      course_id: string
      title: string
      description?: string | null
      order?: number
      created_at?: string
    }
    Update: {
      id?: string
      course_id?: string
      title?: string
      description?: string | null
      order?: number
      created_at?: string
    }
  }
  ats_module_lessons: {
    Row: {
      id: string
      module_id: string
      title: string
      content: string | null
      order: number
      type: string
      created_at: string
    }
    Insert: {
      id?: string
      module_id: string
      title: string
      content?: string | null
      order?: number
      type?: string
      created_at?: string
    }
    Update: {
      id?: string
      module_id?: string
      title?: string
      content?: string | null
      order?: number
      type?: string
      created_at?: string
    }
  }
}