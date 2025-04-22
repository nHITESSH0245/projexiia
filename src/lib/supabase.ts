import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Use the direct values from the Supabase integration
const supabaseUrl = "https://tnlyjkajoovwviuwrecb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubHlqa2Fqb292d3ZpdXdyZWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMDEwMjcsImV4cCI6MjA1NzY3NzAyN30.N9A0vZcTjsRdUaY00Nd9d_cRwDyPEBfPHX1gqOEKdjE";

// Create Supabase client with the hardcoded values
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helpers
export const signIn = async (email: string, password: string) => {
  try {    
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
