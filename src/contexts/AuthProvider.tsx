import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast } from 'react-hot-toast';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'employer' | 'admin';
  isVerified: boolean;
  createdAt: any;
  updatedAt: any;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    resumeUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  };
  preferences?: {
    jobTypes?: string[];
    locations?: string[];
    salaryRange?: [number, number];
    remoteOnly?: boolean;
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create user profile in Firestore
  const createUserProfile = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user;
      const userData: UserProfile = {
        uid: user.uid,
        email: email || '',
        displayName: displayName || '',
        photoURL: photoURL || undefined,
        role: 'student',
        isVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile: {
          firstName: displayName?.split(' ')[0] || '',
          lastName: displayName?.split(' ').slice(1).join(' ') || '',
        },
        preferences: {
          jobTypes: [],
          locations: [],
          salaryRange: [0, 200000],
          remoteOnly: false,
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        ...additionalData
      };

      try {
        await setDoc(userRef, userData);
        setUserProfile(userData);
      } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
    } else {
      const existingData = userSnap.data() as UserProfile;
      setUserProfile(existingData);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        setUserProfile(userData);
        return userData;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    return null;
  };

  // Register with email and password
  const register = async (email: string, password: string, userData: Partial<UserProfile> = {}) => {
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userData.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }
      
      await createUserProfile(user, userData);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const { user } = await signInWithPopup(auth, provider);
      await createUserProfile(user);
      toast.success('Signed in with Google!');
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with Facebook
  const loginWithFacebook = async () => {
    try {
      setLoading(true);
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      
      const { user } = await signInWithPopup(auth, provider);
      await createUserProfile(user);
      toast.success('Signed in with Facebook!');
    } catch (error: any) {
      console.error('Facebook login error:', error);
      toast.error(error.message || 'Failed to sign in with Facebook');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updateData } : null);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!currentUser) return;
    await fetchUserProfile(currentUser.uid);
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
    loginWithGoogle,
    loginWithFacebook,
    updateUserProfile,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
