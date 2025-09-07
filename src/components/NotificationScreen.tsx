import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Briefcase, 
  Star, 
  Calendar,
  CheckCircle2,
  Clock,
  Check,
  BellOff
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

// Define our internal notification type with a more restricted set of types
type InternalNotificationType = 'match' | 'message' | 'job' | 'review' | 'reminder';

interface UINotification {
  id: string;
  type: InternalNotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export function NotificationScreen() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    hasUnread 
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('all');
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  
  // Map Firestore notifications to our local format
  const mappedNotifications = React.useMemo(() => {
    return notifications.map(notif => {
      // Safely handle the timestamp conversion
      let timestamp = 'Just now';
      if (notif.createdAt) {
        try {
          let date: Date;
          const createdAt = notif.createdAt as any; // Type assertion to handle Firestore timestamp
          
          if (createdAt instanceof Date) {
            date = createdAt;
          } else if (typeof createdAt === 'string') {
            date = new Date(createdAt);
          } else if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
            // This is a Firestore timestamp
            date = createdAt.toDate();
          } else if (createdAt && typeof createdAt === 'object' && 'seconds' in createdAt) {
            // This is a Firestore timestamp in { seconds, nanoseconds } format
            date = new Date(createdAt.seconds * 1000);
          } else {
            date = new Date();
          }
          
          if (date && !isNaN(date.getTime())) {
            timestamp = formatDistanceToNow(date, { addSuffix: true });
          }
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      }

      // Map notification types to our internal types
      let type: InternalNotificationType = 'reminder'; // Default type
      const notifType = notif.type?.toLowerCase() || '';
      
      if (['match', 'message', 'job', 'review', 'reminder'].includes(notifType)) {
        type = notifType as InternalNotificationType;
      } else if (notifType === 'job_match') {
        type = 'match';
      } else if (notifType === 'application') {
        type = 'job';
      } else if (notifType === 'payment') {
        type = 'reminder';
      }

      return {
        id: notif.id,
        type,
        title: notif.title || 'New Notification',
        description: notif.message || '',
        timestamp,
        isRead: !!notif.read,
        actionUrl: notif.actionUrl
      };
    });
  }, [notifications]);
  
  const unreadNotifications = React.useMemo(() => 
    mappedNotifications.filter(n => !n.isRead),
    [mappedNotifications]
  );
  
  const handleMarkAllAsRead = async () => {
    if (isMarkingAll) return;
    
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_match':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'application':
        return <Briefcase className="w-5 h-5 text-green-500" />;
      case 'review':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'payment':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };
  
  const getNotificationTime = (timestamp: string) => {
    return (
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <Clock className="w-3 h-3 mr-1" />
        {timestamp}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className={cn(
                "w-6 h-6",
                hasUnread ? "text-primary" : "text-muted-foreground"
              )} />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive"></span>
              )}
            </div>
            <h1 className="text-xl font-bold">Notifications</h1>
            {hasUnread && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={!hasUnread || isMarkingAll}
            className="text-xs flex items-center gap-1"
          >
            {isMarkingAll ? (
              <>
                <span className="animate-pulse">Updating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </>
            )}
          </Button>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All ({mappedNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <AnimatePresence>
              {mappedNotifications.length > 0 ? (
                <NotificationList 
                  notifications={mappedNotifications}
                  onMarkAsRead={markAsRead}
                  getIcon={getNotificationIcon}
                  getTime={getNotificationTime}
                />
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <BellOff className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No notifications yet</h3>
                  <p className="text-muted-foreground text-sm max-w-md px-4">
                    When you get notifications, they'll appear here. Check back later!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="unread" className="mt-4">
            <AnimatePresence>
              {unreadNotifications.length > 0 ? (
                <NotificationList 
                  notifications={unreadNotifications}
                  onMarkAsRead={markAsRead}
                  getIcon={getNotificationIcon}
                  getTime={getNotificationTime}
                />
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-1">All caught up!</h3>
                  <p className="text-muted-foreground text-sm">
                    You don't have any unread notifications.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface NotificationListProps {
  notifications: UINotification[];
  onMarkAsRead: (id: string) => void;
  getIcon: (type: string) => React.ReactNode;
  getTime: (timestamp: string) => React.ReactNode;
}

function NotificationList({ notifications, onMarkAsRead, getIcon, getTime }: NotificationListProps) {

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onMarkAsRead(notification.id)}
            className="cursor-pointer"
          >
            <Card 
              className={`p-4 transition-colors ${
                !notification.isRead ? 'border-l-4 border-l-primary bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-sm ${!notification.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.description}
                      </p>
                      {getTime(notification.timestamp)}
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {notification.actionUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle action URL navigation
                            if (notification.actionUrl) {
                              window.location.href = notification.actionUrl;
                            }
                          }}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}