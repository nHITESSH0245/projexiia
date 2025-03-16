
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types';
import { toast } from 'sonner';

// Notification system functions
export const getNotifications = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { notifications: [], error: new Error('User not authenticated') };
    }

    // Use raw query for now as a workaround since the notification table isn't in the typings
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch notifications error:', error);
      return { notifications: [], error };
    }

    return { notifications: data as unknown as Notification[], error: null };
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return { notifications: [], error };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    // Use raw query for now as a workaround since the notification table isn't in the typings
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select();

    if (error) {
      console.error('Mark notification as read error:', error);
      return { notification: null, error };
    }

    return { notification: data?.[0] as unknown as Notification, error: null };
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return { notification: null, error };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { error: new Error('User not authenticated') };
    }

    // Use raw query for now as a workaround since the notification table isn't in the typings
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userData.user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Mark all notifications as read error:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return { error };
  }
};

// Helper function to create notifications (to be used in other functions)
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: Notification['type'],
  relatedId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_id: relatedId,
        is_read: false
      })
      .select();

    if (error) {
      console.error('Create notification error:', error);
      return { notification: null, error };
    }

    return { notification: data?.[0] as unknown as Notification, error: null };
  } catch (error) {
    console.error('Create notification error:', error);
    return { notification: null, error };
  }
};
