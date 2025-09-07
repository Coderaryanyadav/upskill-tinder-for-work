import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type NotificationType = 'job_match' | 'application' | 'message' | 'review' | 'payment';

export interface NotificationData {
  userId: string | 'all_students';
  type: NotificationType;
  title: string;
  message: string;
  read?: boolean;
  actionUrl?: string;
  createdAt?: Date;
  metadata?: Record<string, any>;
}

export const sendNotification = async (notification: Omit<NotificationData, 'createdAt' | 'read'>) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Helper functions for specific notification types
export const notifyJobMatch = async (userId: string, jobTitle: string, jobId: string) => {
  return sendNotification({
    userId,
    type: 'job_match',
    title: 'New Job Match!',
    message: `You've been matched with a new job: ${jobTitle}`,
    actionUrl: `/jobs/${jobId}`,
  });
};

export const notifyNewMessage = async (userId: string, senderName: string, conversationId: string) => {
  return sendNotification({
    userId,
    type: 'message',
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    actionUrl: `/messages/${conversationId}`,
  });
};

export const notifyApplicationUpdate = async (userId: string, jobTitle: string, status: string, jobId: string) => {
  return sendNotification({
    userId,
    type: 'application',
    title: 'Application Update',
    message: `Your application for ${jobTitle} has been ${status}`,
    actionUrl: `/jobs/${jobId}`,
  });
};

export const notifyNewReview = async (userId: string, reviewerName: string, jobTitle: string, jobId: string) => {
  return sendNotification({
    userId,
    type: 'review',
    title: 'New Review Received',
    message: `${reviewerName} left you a review for ${jobTitle}`,
    actionUrl: `/jobs/${jobId}/reviews`,
  });
};

export const notifyPayment = async (userId: string, amount: number, jobTitle: string) => {
  return sendNotification({
    userId,
    type: 'payment',
    title: 'Payment Received',
    message: `You've received a payment of $${amount.toFixed(2)} for ${jobTitle}`,
    actionUrl: '/earnings',
  });
};
