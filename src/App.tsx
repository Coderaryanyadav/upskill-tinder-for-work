import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { OnboardingScreen } from './components/OnboardingScreen';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import { AuthProvider } from './contexts/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';

type AppState = 'onboarding' | 'login' | 'app';
type UserType = 'student' | 'employer' | null;

export default function App() {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [userType, setUserType] = useState<UserType>(null);
  const [isDark, setIsDark] = useState(true);

  const handleStateChange = (newState: AppState, type?: UserType) => {
    setAppState(newState);
    if (type) setUserType(type);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
          <div className="bg-background text-foreground transition-colors duration-300">
            {appState === 'onboarding' && (
              <OnboardingScreen onComplete={() => handleStateChange('login')} />
            )}
            {appState === 'login' && (
              <LoginScreen 
                onLogin={(type) => handleStateChange('app', type)}
                onBack={() => handleStateChange('onboarding')}
              />
            )}
            {appState === 'app' && userType && (
              <MainApp 
                userType={userType} 
                isDark={isDark}
                setIsDark={setIsDark}
                onLogout={() => handleStateChange('login')}
              />
            )}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#f9fafb' : '#111827',
                border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
              },
            }}
          />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}