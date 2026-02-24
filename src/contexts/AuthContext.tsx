import React, { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type UserJobGrade = '1.1' | '1.2' | '2.1' | '2.2' | '3.1' | '3.2' | '5';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'viewer';
  job_grade: UserJobGrade | null;
  team_id: string | null;
  department_id: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchUserProfile = useCallback(async (userId: string, retryCount = 0): Promise<User | null> => {
    // Prevent duplicate fetches
    if (fetchingRef.current) return null;
    fetchingRef.current = true;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, team_id, department_id, is_active')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('[Auth] Error loading user profile:', error);
        // DON'T sign out - just return null so session stays intact
        return null;
      }

      if (data) {
        // Check if user is deactivated
        if (data.is_active === false) {
          toast.error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
          await supabase.auth.signOut();
          return null;
        }

        return {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role as 'admin' | 'manager' | 'viewer',
          job_grade: null,
          team_id: data.team_id,
          department_id: data.department_id,
        };
      }

      // User profile doesn't exist - create it
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        const newUser: User = {
          id: authUser.user.id,
          email: authUser.user.email || '',
          full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || 'User',
          role: 'viewer',
          job_grade: null,
          team_id: null,
          department_id: null,
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert([newUser]);

        if (insertError) {
          console.error('[Auth] Error creating user profile:', insertError);
          return null;
        }

        return newUser;
      }

      return null;
    } catch (err) {
      console.error(`[Auth] fetchUserProfile error (attempt ${retryCount + 1}):`, err);

      // Retry up to 2 times
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        fetchingRef.current = false;
        return fetchUserProfile(userId, retryCount + 1);
      }

      return null;
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Use ONLY onAuthStateChange - it fires INITIAL_SESSION on mount
    // This avoids the race condition between getSession() and onAuthStateChange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (mountedRef.current) {
          setUser(profile);
          setLoading(false);
        }
      } else {
        if (mountedRef.current) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    // Safety timeout - prevent infinite loading if Supabase is unreachable
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn('[Auth] Timeout after 15 seconds - forcing stop');
        setLoading(false);
      }
    }, 15000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Check if user is active before allowing login
      const { data: userData } = await supabase
        .from('users')
        .select('is_active')
        .eq('id', data.user.id)
        .maybeSingle();

      if (userData && userData.is_active === false) {
        await supabase.auth.signOut();
        throw new Error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
      }

      // Profile will be fetched by onAuthStateChange listener
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Create user profile in users table
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role: 'viewer',
        },
      ]);

      if (profileError) throw profileError;
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
