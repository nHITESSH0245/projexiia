
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Create Supabase client with fallback values for development
export const supabase = createClient(
  // Use dummy values if not available to prevent runtime errors
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Authentication helpers
export const signIn = async (email: string, password: string) => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error('Supabase credentials are not configured. Please contact the administrator.');
      return { user: null, error: new Error('Supabase credentials not configured') };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    toast.error('Failed to sign in. Please try again.');
    return { user: null, error };
  }
};

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: 'student' | 'faculty'
) => {
  try {
    // 1. Create the user in Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return { user: null, error };
    }

    // 2. Insert user profile data
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          name,
          role,
        });

      if (profileError) {
        toast.error('Profile creation failed. Please contact support.');
        return { user: null, error: profileError };
      }
    }

    toast.success('Account created! Please check your email to confirm your registration.');
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    toast.error('Failed to sign up. Please try again.');
    return { user: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return { error };
    }
    
    toast.success('Signed out successfully');
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    toast.error('Failed to sign out. Please try again.');
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      return { user: null, error };
    }
    
    // Get the profile data which includes the role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return { user: data.user, profile: null, error: profileError };
    }
    
    return { 
      user: data.user, 
      profile: profileData,
      error: null 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, profile: null, error };
  }
};
