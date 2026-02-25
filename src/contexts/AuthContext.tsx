import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
  // undefined = not yet checked, null = no session, string = has session
  const [authUserId, setAuthUserId] = useState<string | null | undefined>(undefined);

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      console.log('[Auth] Fetching profile for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, team_id, department_id, is_active')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('[Auth] Profile query error:', error);
        return null;
      }

      if (data) {
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
          console.error('[Auth] Error creating profile:', insertError);
          return null;
        }

        return newUser;
      }

      return null;
    } catch (err) {
      console.error('[Auth] fetchUserProfile error:', err);
      return null;
    }
  };

  // Step 1: Listen for auth state changes - ONLY set React state, NO Supabase calls
  // This avoids Supabase internal deadlock when calling DB queries inside onAuthStateChange
  useEffect(() => {
    console.log('[Auth] Setting up onAuthStateChange listener');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange:', event, session?.user?.id || 'no user');
      if (session?.user) {
        setAuthUserId(session.user.id);
      } else {
        setAuthUserId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Step 2: Fetch profile OUTSIDE of onAuthStateChange when authUserId changes
  useEffect(() => {
    // Still waiting for onAuthStateChange to fire
    if (authUserId === undefined) return;

    // No session - not logged in
    if (authUserId === null) {
      console.log('[Auth] No session - redirecting to login');
      setUser(null);
      setLoading(false);
      return;
    }

    // Has session - fetch profile
    let cancelled = false;
    console.log('[Auth] Session found, fetching profile...');

    fetchUserProfile(authUserId).then((profile) => {
      if (!cancelled) {
        console.log('[Auth] Profile loaded:', profile?.email || 'null');
        setUser(profile);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authUserId]);

  // Safety timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[Auth] Timeout after 10 seconds - forcing stop');
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

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

      // Fetch profile immediately for signIn (not inside onAuthStateChange)
      const profile = await fetchUserProfile(data.user.id);
      setUser(profile);
      setLoading(false);
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
