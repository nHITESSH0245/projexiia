
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/types';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notification';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export const NotificationsList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { notifications, error } = await getNotifications();
      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      setNotifications(notifications);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications
    const intervalId = setInterval(fetchNotifications, 60000); // Poll every minute
    
    return () => clearInterval(intervalId);
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    await markNotificationAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'feedback' || notification.type === 'status_change') {
      if (notification.related_id) {
        navigate(`/projects/${notification.related_id}`);
      }
    } else if (notification.type === 'task_assigned') {
      if (notification.related_id) {
        navigate(`/projects/${notification.related_id}`);
      }
    }
    
    // Refresh notifications
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'feedback':
        return <div className="h-2 w-2 rounded-full bg-blue-500" />;
      case 'status_change':
        return <div className="h-2 w-2 rounded-full bg-green-500" />;
      case 'task_assigned':
        return <div className="h-2 w-2 rounded-full bg-purple-500" />;
      case 'deadline':
        return <div className="h-2 w-2 rounded-full bg-orange-500" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-5 p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto py-1"
              onClick={handleMarkAllAsRead}
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-2 p-3 cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
