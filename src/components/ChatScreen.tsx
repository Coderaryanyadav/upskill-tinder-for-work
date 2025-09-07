import { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { Search, Send, MoreVertical, Briefcase, Loader2, AlertTriangle, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { useAppContext, Conversation } from '../contexts/AppContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp, 
  Timestamp
} from 'firebase/firestore';
import { formatTimestamp } from '../utils/dateUtils';



interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Timestamp | Date;
  type: 'text' | 'job' | 'system';
}

export function ChatScreen() {
  const { currentUser } = useAppContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    const messagesCollection = collection(db, 'conversations', selectedConversation.id, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setMessagesLoading(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError('Failed to load messages.');
      setMessagesLoading(false);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const conversationsCollection = collection(db, 'conversations');
    const q = query(
      conversationsCollection,
      where('participantIds', 'array-contains', currentUser.id)
      // orderBy('lastMessage.timestamp', 'desc') // This requires an index
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      // Sort client-side for now
      convos.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp as Timestamp | undefined;
        const timeB = b.lastMessage?.timestamp as Timestamp | undefined;
        return (timeB?.toMillis() || 0) - (timeA?.toMillis() || 0);
      });
      setConversations(convos);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching conversations:", err);
      setError('Failed to load conversations.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !currentUser) return;

    const now = new Date();
    
    // Create a temporary message ID for optimistic UI
    const tempMessageId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempMessageId,
      senderId: currentUser.id,
      content: messageInput,
      timestamp: now,
      type: 'text'
    };

    // Optimistically update the UI
    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');

    try {
      // Add the message to Firestore
      const messagesCollection = collection(db, 'conversations', selectedConversation.id, 'messages');
      const docRef = await addDoc(messagesCollection, {
        ...newMessage,
        timestamp: serverTimestamp(),
        read: false
      });

      // Update the conversation's last message
      const conversationRef = doc(db, 'conversations', selectedConversation.id);
      await updateDoc(conversationRef, {
        lastMessage: {
          content: messageInput,
          timestamp: serverTimestamp(),
          type: 'text',
          read: false
        },
        updatedAt: serverTimestamp(),
        // Make sure participant data is up to date
        participants: selectedConversation.participants.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          photoURL: p.photoURL
        }))
      });
      
      // Remove the temporary message and add the real one with server timestamp
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== newMessage.id);
        return [...filtered, { ...newMessage, id: docRef.id, timestamp: now }];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      // Revert optimistic update on error
      setMessages(prev => prev.filter(m => m.id !== tempMessageId));
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== currentUser?.id);
    return (
      otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-8 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-3">No conversations yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            When you match with a job or receive a message, it will appear here. Start applying to jobs to get connected with employers!
          </p>
          <Button 
            onClick={() => window.location.href = '/jobs'}
            className="w-full sm:w-auto mx-auto"
          >
            Browse Jobs
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium text-destructive mb-2">Oops! Something went wrong</h3>
          <p className="text-muted-foreground text-sm mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  if (selectedConversation) {
    const chat = selectedConversation;
    const otherParticipant = chat.participants.find(p => p.id !== currentUser?.id);

    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedConversation(null)}
          >
            ←
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-sm">{otherParticipant?.name}</h3>
            {chat.jobTitle && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {chat.jobTitle}
                </Badge>
                <Badge 
                  variant={chat.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {chat.status}
                </Badge>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messagesLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-2xl ${
                    message.senderId === currentUser?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === currentUser?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp ? formatTimestamp(message.timestamp) : ''}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg mb-3">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg mb-2">No conversations yet</h3>
              <p className="text-muted-foreground text-sm">
                {currentUser?.type === 'student' 
                  ? 'Start applying to jobs to connect with employers'
                  : 'Post jobs to start receiving applications'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredConversations.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedConversation(chat)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>{chat.participants.find(p => p.id !== currentUser?.id)?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm truncate">{chat.participants.find(p => p.id !== currentUser?.id)?.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(chat.lastMessage?.timestamp)}
                          </span>
                          {/* Unread count logic would be implemented here */}
                          {/* Unread count logic would be implemented here */}
                          {/* {chat.unread > 0 && (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-xs text-primary-foreground">{chat.unread}</span>
                            </div>
                          )} */}
                        </div>
                      </div>
                      {chat.jobTitle && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {chat.jobTitle}
                          </Badge>
                          {chat.status && (
                            <Badge 
                              variant={chat.status === 'archived' ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {chat.status || 'active'}
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage?.content}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}