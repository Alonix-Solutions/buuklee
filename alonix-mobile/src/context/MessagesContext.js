import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const MessagesContext = createContext({});

export const MessagesProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setMessages({});
      setIsLoading(false);
    }
  }, [user]);

  // Update total unread count
  useEffect(() => {
    const count = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    setTotalUnreadCount(count);
  }, [conversations]);

  // Load conversations from storage
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const storedConversations = await AsyncStorage.getItem('@conversations');
      const storedMessages = await AsyncStorage.getItem('@messages');

      if (storedConversations && storedMessages) {
        setConversations(JSON.parse(storedConversations));
        setMessages(JSON.parse(storedMessages));
      } else {
        // Initialize with mock data
        const mockData = generateMockConversations();
        setConversations(mockData.conversations);
        setMessages(mockData.messages);
        await saveConversations(mockData.conversations);
        await saveMessages(mockData.messages);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save conversations
  const saveConversations = async (conversationsData) => {
    try {
      await AsyncStorage.setItem('@conversations', JSON.stringify(conversationsData));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  };

  // Save messages
  const saveMessages = async (messagesData) => {
    try {
      await AsyncStorage.setItem('@messages', JSON.stringify(messagesData));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  // Get all conversations
  const getConversations = () => {
    return conversations.sort((a, b) =>
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
  };

  // Get conversation by ID
  const getConversation = (conversationId) => {
    return conversations.find(c => c.id === conversationId);
  };

  // Get messages for a conversation
  const getMessages = (conversationId) => {
    return messages[conversationId] || [];
  };

  // Send message
  const sendMessage = async (conversationId, text, imageUri = null) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return { success: false, error: 'Conversation not found' };
      }

      const newMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        conversationId,
        senderId: user.id,
        senderName: user.name,
        text,
        imageUri,
        timestamp: new Date().toISOString(),
        read: false,
        delivered: false,
      };

      // Add message to conversation
      const conversationMessages = messages[conversationId] || [];
      const updatedMessages = {
        ...messages,
        [conversationId]: [...conversationMessages, newMessage],
      };

      // Update conversation last message
      const updatedConversations = conversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text || 'Image',
            lastMessageTime: newMessage.timestamp,
          };
        }
        return c;
      });

      setMessages(updatedMessages);
      setConversations(updatedConversations);

      await saveMessages(updatedMessages);
      await saveConversations(updatedConversations);

      // Simulate delivery
      setTimeout(() => {
        markMessageAsDelivered(conversationId, newMessage.id);
      }, 1000);

      return { success: true, message: newMessage };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  };

  // Mark message as delivered
  const markMessageAsDelivered = async (conversationId, messageId) => {
    try {
      const conversationMessages = messages[conversationId] || [];
      const updatedMessages = {
        ...messages,
        [conversationId]: conversationMessages.map(m =>
          m.id === messageId ? { ...m, delivered: true } : m
        ),
      };

      setMessages(updatedMessages);
      await saveMessages(updatedMessages);
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  };

  // Mark message as read
  const markMessageAsRead = async (conversationId, messageId) => {
    try {
      const conversationMessages = messages[conversationId] || [];
      const updatedMessages = {
        ...messages,
        [conversationId]: conversationMessages.map(m =>
          m.id === messageId ? { ...m, read: true, delivered: true } : m
        ),
      };

      setMessages(updatedMessages);
      await saveMessages(updatedMessages);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark all messages in conversation as read
  const markConversationAsRead = async (conversationId) => {
    try {
      const conversationMessages = messages[conversationId] || [];
      const updatedMessages = {
        ...messages,
        [conversationId]: conversationMessages.map(m => ({
          ...m,
          read: true,
          delivered: true,
        })),
      };

      const updatedConversations = conversations.map(c => {
        if (c.id === conversationId) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      });

      setMessages(updatedMessages);
      setConversations(updatedConversations);

      await saveMessages(updatedMessages);
      await saveConversations(updatedConversations);

      return { success: true };
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      return { success: false, error: error.message };
    }
  };

  // Create new conversation
  const createConversation = async (participant) => {
    try {
      // Check if conversation already exists
      const existing = conversations.find(
        c => c.participants.some(p => p.id === participant.id)
      );

      if (existing) {
        return { success: true, conversation: existing };
      }

      const newConversation = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        participants: [participant],
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      };

      const updatedConversations = [...conversations, newConversation];
      setConversations(updatedConversations);
      await saveConversations(updatedConversations);

      return { success: true, conversation: newConversation };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete conversation
  const deleteConversation = async (conversationId) => {
    try {
      const updatedConversations = conversations.filter(c => c.id !== conversationId);
      const updatedMessages = { ...messages };
      delete updatedMessages[conversationId];

      setConversations(updatedConversations);
      setMessages(updatedMessages);

      await saveConversations(updatedConversations);
      await saveMessages(updatedMessages);

      return { success: true };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return { success: false, error: error.message };
    }
  };

  // Search conversations
  const searchConversations = (query) => {
    if (!query.trim()) {
      return conversations;
    }

    const lowerQuery = query.toLowerCase();
    return conversations.filter(conv => {
      // Search in participant names
      const participantMatch = conv.participants.some(p =>
        p.name.toLowerCase().includes(lowerQuery)
      );

      // Search in last message
      const messageMatch = conv.lastMessage.toLowerCase().includes(lowerQuery);

      return participantMatch || messageMatch;
    });
  };

  const value = {
    conversations,
    messages,
    isLoading,
    totalUnreadCount,
    getConversations,
    getConversation,
    getMessages,
    sendMessage,
    markMessageAsRead,
    markConversationAsRead,
    createConversation,
    deleteConversation,
    searchConversations,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};

// Custom hook
export const useMessages = () => {
  const context = useContext(MessagesContext);

  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }

  return context;
};

// Generate mock conversations
const generateMockConversations = () => {
  const now = new Date();

  const conversations = [
    {
      id: 'conv1',
      participants: [
        {
          id: 'user2',
          name: 'Sarah Johnson',
          avatar: 'https://i.pravatar.cc/150?img=2',
          online: true,
        },
      ],
      lastMessage: 'See you at the trail tomorrow!',
      lastMessageTime: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      unreadCount: 2,
    },
    {
      id: 'conv2',
      participants: [
        {
          id: 'user3',
          name: 'Mike Chen',
          avatar: 'https://i.pravatar.cc/150?img=3',
          online: false,
        },
      ],
      lastMessage: 'Great ride today! 🚴',
      lastMessageTime: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      unreadCount: 0,
    },
    {
      id: 'conv3',
      participants: [
        {
          id: 'user4',
          name: 'Alex Martinez',
          avatar: 'https://i.pravatar.cc/150?img=4',
          online: true,
        },
      ],
      lastMessage: 'Did you book the hotel yet?',
      lastMessageTime: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      unreadCount: 1,
    },
    {
      id: 'conv4',
      participants: [
        {
          id: 'user5',
          name: 'Emma Wilson',
          avatar: 'https://i.pravatar.cc/150?img=5',
          online: false,
        },
      ],
      lastMessage: 'Thanks for the tips!',
      lastMessageTime: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      unreadCount: 0,
    },
  ];

  const messages = {
    conv1: [
      {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: 'user2',
        senderName: 'Sarah Johnson',
        text: 'Hey! Are you joining the Mountain Peak Challenge?',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
        read: true,
        delivered: true,
      },
      {
        id: 'msg2',
        conversationId: 'conv1',
        senderId: '1',
        senderName: 'John Doe',
        text: 'Absolutely! I\'ve been training for it',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2.5).toISOString(),
        read: true,
        delivered: true,
      },
      {
        id: 'msg3',
        conversationId: 'conv1',
        senderId: 'user2',
        senderName: 'Sarah Johnson',
        text: 'Perfect! We should meet at the trailhead at 7 AM',
        timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
        read: false,
        delivered: true,
      },
      {
        id: 'msg4',
        conversationId: 'conv1',
        senderId: 'user2',
        senderName: 'Sarah Johnson',
        text: 'See you at the trail tomorrow!',
        timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        read: false,
        delivered: true,
      },
    ],
    conv2: [
      {
        id: 'msg5',
        conversationId: 'conv2',
        senderId: 'user3',
        senderName: 'Mike Chen',
        text: 'Great ride today! 🚴',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
        read: true,
        delivered: true,
      },
      {
        id: 'msg6',
        conversationId: 'conv2',
        senderId: '1',
        senderName: 'John Doe',
        text: 'Thanks! Same time next week?',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 1.5).toISOString(),
        read: true,
        delivered: true,
      },
    ],
    conv3: [
      {
        id: 'msg7',
        conversationId: 'conv3',
        senderId: 'user4',
        senderName: 'Alex Martinez',
        text: 'Did you book the hotel yet?',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
        read: false,
        delivered: true,
      },
    ],
    conv4: [
      {
        id: 'msg8',
        conversationId: 'conv4',
        senderId: '1',
        senderName: 'John Doe',
        text: 'Here are some tips for your first marathon',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1.2).toISOString(),
        read: true,
        delivered: true,
      },
      {
        id: 'msg9',
        conversationId: 'conv4',
        senderId: 'user5',
        senderName: 'Emma Wilson',
        text: 'Thanks for the tips!',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
        delivered: true,
      },
    ],
  };

  return { conversations, messages };
};

export default MessagesContext;
