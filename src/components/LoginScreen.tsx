import { useState } from 'react';
import { motion } from "framer-motion";
import { ChevronLeft, User, Building, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useAppContext } from '../contexts/AppContext';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface LoginScreenProps {
  onLogin: (userType: 'student' | 'employer') => void;
  onBack: () => void;
}

export function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [userType, setUserType] = useState<'student' | 'employer'>('student');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { loading } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin && !name) {
      setError('Please enter your name');
      return;
    }

    try {
      let userCredential;
      if (isLogin) {
        // Sign in user
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Create new user
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // Save user details to Firestore
        await setDoc(doc(db, 'users', newUser.uid), {
          name: name.trim(),
          email: newUser.email,
          type: userType,
          skills: [],
          company: userType === 'employer' ? name.trim() : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          bio: '',
          location: '',
          phone: ''
        });
      }
      
      // The onAuthStateChanged in AppProvider will handle the redirect
      // We don't need to manually set the current user here
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // More specific error messages
      let errorMessage = 'An error occurred during authentication.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use. Please use a different email or log in.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      // The onAuthStateChanged in AppProvider will handle the user data
      await signInWithPopup(auth, provider);
      // User is signed in via Google
      // No need to manually set user data here as it's handled by the auth state listener
      // The user document will be created in the auth state listener if it doesn't exist
      onLogin(userType);
    } catch (error: any) {
      setError(error.message);
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-lg">Welcome to Opskl</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 space-y-6">
          {/* User type selection */}
          <div className="space-y-4">
            <h2 className="text-xl text-center">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            
            <div className="flex space-x-2">
              <Button
                variant={userType === 'student' ? 'default' : 'outline'}
                onClick={() => setUserType('student')}
                className="flex-1"
              >
                <User className="w-4 h-4 mr-2" />
                Student
              </Button>
              <Button
                variant={userType === 'employer' ? 'default' : 'outline'}
                onClick={() => setUserType('employer')}
                className="flex-1"
              >
                <Building className="w-4 h-4 mr-2" />
                Employer
              </Button>
            </div>

            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                {userType === 'student' ? 'Find flexible work opportunities' : 'Post jobs and find talent'}
              </Badge>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={userType === 'student' ? 'Full name' : 'Company name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </motion.div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || !email || !password || (!isLogin && !name)}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-muted"></div>
              <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              Sign In with Google
            </Button>

          </form>

          {/* Toggle login/signup */}
          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="text-center text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p>Demo credentials:</p>
            <p>student@demo.com / employer@demo.com</p>
            <p>Password: demo123</p>
          </div>
        </Card>
      </div>
    </div>
  );
}