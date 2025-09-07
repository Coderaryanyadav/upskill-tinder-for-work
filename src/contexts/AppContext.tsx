import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, orderBy, updateDoc } from 'firebase/firestore';

// UserProfile interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'employer';
  photoURL?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: Array<{
    id?: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    skills?: string[];
    employmentType?: string;
  }>;
  education?: Array<{
    id?: string;
    school: string;
    degree: string;
    fieldOfStudy?: string;
    startYear: number;
    endYear?: number;
    gpa?: number;
    description?: string;
  }>;
  availability?: {
    hoursPerWeek?: number;
    schedule?: 'weekdays' | 'weekends' | 'flexible' | 'mornings' | 'afternoons' | 'evenings';
  };
  title?: string;
  company?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Job interface
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  distance: number;
  hourlyRate: number;
  duration: string;
  category: string;
  skills: string[];
  description: string;
  requirements: string[];
  image: string;
  isUrgent?: boolean;
  isRemote?: boolean;
  status: 'active' | 'draft' | 'completed' | 'paused';
  employerId: string;
  employerName: string;
  applicants: Application[];
  createdAt: Date;
  updatedAt: Date;
}

// Application interface  
export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentSkills: string[];
  appliedAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'interviewing';
  message?: string;
}

// Message interface
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

// Conversation interface
export interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    type: 'student' | 'employer';
    photoURL?: string;
  }>;
  messages: Message[];
  lastMessage?: Message;
  jobId?: string;
  jobTitle?: string;
  status?: 'active' | 'archived';
}

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  type: 'job_match' | 'application' | 'message' | 'review' | 'payment';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// App state interface
interface AppState {
  // Current user
  currentUser: {
    id: string;
    name: string;
    email: string;
    type: 'student' | 'employer';
    skills?: string[];
    company?: string;
    bio?: string;
    location?: string;
    phone?: string;
    photoURL?: string;
  } | null;
  setCurrentUser: (user: AppState['currentUser']) => void;
  loading: boolean;
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);


export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppState['currentUser']>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Set up notifications listener
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [currentUser.id, 'all_students']),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsList: Notification[] = [];
      querySnapshot.forEach((doc) => {
        notificationsList.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        } as Notification);
      });
      setNotifications(notificationsList);
    });
    
    return () => unsubscribe();
  }, [currentUser?.id]);
  
  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      if (user) {
        // User is signed in
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              id: user.uid,
              name: userData.name || user.displayName || 'User',
              email: user.email || '',
              type: userData.type || 'student',
              skills: userData.skills || [],
              company: userData.company,
              bio: userData.bio,
              location: userData.location,
              phone: userData.phone
            });
          } else {
            // Create user document if it doesn't exist
            await setDoc(doc(db, 'users', user.uid), {
              name: user.displayName || 'New User',
              email: user.email,
              type: 'student',
              createdAt: new Date(),
              updatedAt: new Date()
            });
            setCurrentUser({
              id: user.uid,
              name: user.displayName || 'New User',
              email: user.email || '',
              type: 'student'
            });
          }
        } catch (error) {
          console.error('Error getting user data:', error);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Update Firestore when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      const updateUserDoc = async () => {
        try {
          await setDoc(
            doc(db, 'users', currentUser.id),
            {
              ...currentUser,
              updatedAt: new Date()
            },
            { merge: true }
          );
        } catch (error) {
          console.error('Error updating user data:', error);
        }
      };
      updateUserDoc();
    }
  }, [currentUser]);

  const value: AppState = {
    currentUser,
    setCurrentUser,
    loading,
    notifications,
    markNotificationAsRead
  };

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}