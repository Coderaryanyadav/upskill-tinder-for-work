import { Timestamp } from 'firebase/firestore';

export const formatTimestamp = (timestamp: Timestamp | Date | undefined): string => {
  if (!timestamp) return '';
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  if (timestamp instanceof Date) {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  return '';
};
