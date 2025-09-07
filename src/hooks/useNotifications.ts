import { useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'job' | 'review' | 'reminder' | 'application' | 'job_match' | 'payment';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt?: {
    toDate: () => Date;
  } | Date | string;
}

export const useNotifications = () => {
  const { currentUser, notifications, markNotificationAsRead } = useAppContext();
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count when notifications change
  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      // Update browser tab title with unread count
      if (unread > 0) {
        document.title = `(${unread}) Tinder for Work`;
      } else {
        document.title = 'Tinder for Work';
      }
    }
  }, [notifications]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    if (currentUser) {
      await markNotificationAsRead(notificationId);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    const unreadNotifications = notifications.filter(n => !n.read);
    await Promise.all(
      unreadNotifications.map(notif => markNotificationAsRead(notif.id))
    );
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    hasUnread: unreadCount > 0
  };
};
