import { useNotifications } from '../hooks/useNotifications';
import { cn } from '../lib/utils';

export function NotificationBadge() {
  const { unreadCount } = useNotifications();
  
  if (unreadCount === 0) {
    return null;
  }
  
  return (
    <span className={cn(
      "absolute -top-1 -right-1 flex items-center justify-center",
      "min-w-4 h-4 rounded-full text-[10px] font-medium",
      "bg-destructive text-destructive-foreground"
    )}>
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}
