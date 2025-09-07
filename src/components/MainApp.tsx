import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Briefcase, 
  MessageCircle, 
  User, 
  Bell, 
  Plus,
  BarChart3,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from './ui/button';
import ProductionJobList from './ProductionJobList';
import { Dashboard } from './Dashboard';
import { ProfileScreen } from './ProfileScreen';
import { ChatScreen } from './ChatScreen';
import { NotificationScreen } from './NotificationScreen';
import { EmployerPostJob } from './EmployerPostJob';
import { EmployerJobManagement } from './EmployerJobManagement';
import { NotificationBadge } from './NotificationBadge';

interface MainAppProps {
  userType: 'student' | 'employer';
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onLogout: () => void;
}

type StudentTab = 'jobs' | 'dashboard' | 'chat' | 'profile' | 'notifications';
type EmployerTab = 'dashboard' | 'post' | 'jobs' | 'chat' | 'profile' | 'notifications';

export function MainApp({ userType, isDark, setIsDark, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<StudentTab | EmployerTab>(
    userType === 'student' ? 'jobs' : 'dashboard'
  );

  const studentTabs = [
    { id: 'jobs', icon: Home, label: 'Jobs' },
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const employerTabs = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'post', icon: Plus, label: 'Post Job' },
    { id: 'jobs', icon: Briefcase, label: 'My Jobs' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const tabs = userType === 'student' ? studentTabs : employerTabs;

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return userType === 'student' ? <ProductionJobList /> : <EmployerJobManagement />;
      case 'dashboard':
        return <Dashboard userType={userType} />;
      case 'chat':
        return <ChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'notifications':
        return <NotificationScreen />;
      case 'post':
        return <EmployerPostJob />;
      default:
        return <div>Screen not implemented</div>;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl">Opskl</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('notifications')}
            className="relative"
          >
            <Bell className="w-4 h-4" />
            <NotificationBadge />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-border bg-card">
        <div className="flex items-center justify-around p-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 flex flex-col items-center p-3 h-auto space-y-1"
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}