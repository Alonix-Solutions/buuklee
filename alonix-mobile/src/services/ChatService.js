/**
 * ChatService.js
 * Real-time chat service with WebSocket simulation
 * Handles message sending, receiving, typing indicators, and read receipts
 */

class ChatService {
  constructor() {
    this.listeners = [];
    this.typingListeners = [];
    this.statusListeners = [];
    this.connectionListeners = [];
    this.messages = new Map();
    this.connected = false;
    this.reconnectTimer = null;
    this.userStatus = new Map(); // Track user online/offline status
  }

  /**
   * Initialize connection (simulated WebSocket)
   */
  connect() {
    return new Promise((resolve) => {
      // Simulate connection delay
      setTimeout(() => {
        this.connected = true;
        console.log('[ChatService] Connected to chat server');
        this.notifyConnectionListeners(true);
        resolve(true);

        // Simulate periodic status updates
        this.startStatusUpdates();
      }, 500);
    });
  }

  /**
   * Disconnect from chat service
   */
  disconnect() {
    this.connected = false;
    this.notifyConnectionListeners(false);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Clear all listeners
    this.listeners = [];
    this.typingListeners = [];
    this.statusListeners = [];
    this.connectionListeners = [];

    console.log('[ChatService] Disconnected from chat server');
  }

  /**
   * Send a text message
   */
  sendMessage(chatId, message) {
    return new Promise((resolve) => {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const messageData = {
        id: messageId,
        chatId,
        text: message.text,
        type: message.type || 'text',
        senderId: message.senderId,
        senderName: message.senderName,
        timestamp: new Date().toISOString(),
        status: 'sending',
        reactions: [],
        replyTo: message.replyTo || null,
      };

      // Store message
      this.messages.set(messageId, messageData);

      // Simulate network delay
      setTimeout(() => {
        messageData.status = 'sent';
        this.notifyListeners('message:sent', messageData);

        // Simulate delivery after a short delay
        setTimeout(() => {
          messageData.status = 'delivered';
          this.notifyListeners('message:delivered', messageData);

          // Simulate read receipt (50% chance after 1-3 seconds)
          if (Math.random() > 0.5) {
            setTimeout(() => {
              messageData.status = 'read';
              this.notifyListeners('message:read', messageData);
            }, 1000 + Math.random() * 2000);
          }
        }, 300 + Math.random() * 500);
      }, 200 + Math.random() * 300);

      resolve(messageData);
    });
  }

  /**
   * Send an image message
   */
  sendImage(chatId, imageData) {
    return new Promise((resolve) => {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const messageData = {
        id: messageId,
        chatId,
        type: 'image',
        imageUri: imageData.uri,
        thumbnail: imageData.thumbnail,
        senderId: imageData.senderId,
        senderName: imageData.senderName,
        timestamp: new Date().toISOString(),
        status: 'uploading',
        uploadProgress: 0,
        reactions: [],
      };

      this.messages.set(messageId, messageData);
      this.notifyListeners('message:uploading', messageData);

      // Simulate upload progress
      let progress = 0;
      const uploadInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(uploadInterval);

          messageData.status = 'sent';
          messageData.uploadProgress = 100;
          this.notifyListeners('message:sent', messageData);

          // Simulate delivery
          setTimeout(() => {
            messageData.status = 'delivered';
            this.notifyListeners('message:delivered', messageData);
          }, 500);
        } else {
          messageData.uploadProgress = progress;
          this.notifyListeners('message:upload-progress', messageData);
        }
      }, 200);

      resolve(messageData);
    });
  }

  /**
   * Send a voice message
   */
  sendVoiceMessage(chatId, voiceData) {
    return new Promise((resolve) => {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const messageData = {
        id: messageId,
        chatId,
        type: 'voice',
        audioUri: voiceData.uri,
        duration: voiceData.duration,
        waveform: voiceData.waveform || [],
        senderId: voiceData.senderId,
        senderName: voiceData.senderName,
        timestamp: new Date().toISOString(),
        status: 'uploading',
        uploadProgress: 0,
        reactions: [],
      };

      this.messages.set(messageId, messageData);
      this.notifyListeners('message:uploading', messageData);

      // Simulate upload
      setTimeout(() => {
        messageData.status = 'sent';
        messageData.uploadProgress = 100;
        this.notifyListeners('message:sent', messageData);

        setTimeout(() => {
          messageData.status = 'delivered';
          this.notifyListeners('message:delivered', messageData);
        }, 500);
      }, 1000 + Math.random() * 1000);

      resolve(messageData);
    });
  }

  /**
   * Receive a message (simulated)
   */
  simulateIncomingMessage(chatId, senderId, senderName) {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const messages = [
      'Hey! How are you?',
      'That sounds great!',
      'When can we meet?',
      'Thanks for the update 👍',
      'Let me check and get back to you',
      'Perfect! See you then',
      'Can you send me the details?',
      '😂😂😂',
      'Absolutely!',
      'I agree with you',
    ];

    const messageData = {
      id: messageId,
      chatId,
      text: messages[Math.floor(Math.random() * messages.length)],
      type: 'text',
      senderId,
      senderName,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      reactions: [],
      isIncoming: true,
    };

    this.messages.set(messageId, messageData);
    this.notifyListeners('message:received', messageData);

    return messageData;
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(chatId, userId, isTyping) {
    this.notifyTypingListeners({
      chatId,
      userId,
      isTyping,
      timestamp: Date.now(),
    });

    // Simulate other user typing back (20% chance)
    if (isTyping && Math.random() > 0.8) {
      setTimeout(() => {
        this.notifyTypingListeners({
          chatId,
          userId: 'other_user',
          isTyping: true,
          timestamp: Date.now(),
        });

        // Stop typing after 2-4 seconds
        setTimeout(() => {
          this.notifyTypingListeners({
            chatId,
            userId: 'other_user',
            isTyping: false,
            timestamp: Date.now(),
          });

          // Send a message after typing
          setTimeout(() => {
            this.simulateIncomingMessage(chatId, 'other_user', 'John Doe');
          }, 500);
        }, 2000 + Math.random() * 2000);
      }, 1000);
    }
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId) {
    const message = this.messages.get(messageId);
    if (message) {
      message.status = 'read';
      this.notifyListeners('message:read', message);
    }
  }

  /**
   * Add reaction to message
   */
  addReaction(messageId, reaction, userId) {
    const message = this.messages.get(messageId);
    if (message) {
      const existingReaction = message.reactions.find(r => r.userId === userId);

      if (existingReaction) {
        // Update existing reaction
        existingReaction.emoji = reaction;
      } else {
        // Add new reaction
        message.reactions.push({
          emoji: reaction,
          userId,
          timestamp: Date.now(),
        });
      }

      this.notifyListeners('message:reaction', message);
    }
  }

  /**
   * Remove reaction from message
   */
  removeReaction(messageId, userId) {
    const message = this.messages.get(messageId);
    if (message) {
      message.reactions = message.reactions.filter(r => r.userId !== userId);
      this.notifyListeners('message:reaction', message);
    }
  }

  /**
   * Delete message
   */
  deleteMessage(messageId) {
    const message = this.messages.get(messageId);
    if (message) {
      message.deleted = true;
      message.text = 'This message was deleted';
      this.notifyListeners('message:deleted', message);
    }
  }

  /**
   * Get user online status
   */
  getUserStatus(userId) {
    return this.userStatus.get(userId) || {
      online: false,
      lastSeen: new Date().toISOString(),
    };
  }

  /**
   * Update user status
   */
  updateUserStatus(userId, online) {
    const status = {
      online,
      lastSeen: new Date().toISOString(),
    };

    this.userStatus.set(userId, status);
    this.notifyStatusListeners({ userId, ...status });
  }

  /**
   * Start periodic status updates (simulation)
   */
  startStatusUpdates() {
    setInterval(() => {
      // Simulate random user going online/offline
      const online = Math.random() > 0.3;
      this.updateUserStatus('other_user', online);
    }, 10000); // Every 10 seconds
  }

  /**
   * Subscribe to messages
   */
  onMessage(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Subscribe to typing indicators
   */
  onTyping(callback) {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter(l => l !== callback);
    };
  }

  /**
   * Subscribe to status updates
   */
  onStatus(callback) {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== callback);
    };
  }

  /**
   * Subscribe to connection status
   */
  onConnection(callback) {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify message listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('[ChatService] Error in listener:', error);
      }
    });
  }

  /**
   * Notify typing listeners
   */
  notifyTypingListeners(data) {
    this.typingListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('[ChatService] Error in typing listener:', error);
      }
    });
  }

  /**
   * Notify status listeners
   */
  notifyStatusListeners(data) {
    this.statusListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('[ChatService] Error in status listener:', error);
      }
    });
  }

  /**
   * Notify connection listeners
   */
  notifyConnectionListeners(connected) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('[ChatService] Error in connection listener:', error);
      }
    });
  }

  /**
   * Encrypt message (placeholder)
   */
  encryptMessage(message) {
    // Placeholder for end-to-end encryption
    // In production, implement proper E2EE (e.g., Signal Protocol)
    return {
      encrypted: true,
      payload: btoa(message), // Simple base64 encoding for demo
    };
  }

  /**
   * Decrypt message (placeholder)
   */
  decryptMessage(encryptedPayload) {
    // Placeholder for decryption
    try {
      return atob(encryptedPayload);
    } catch (error) {
      return '[Encrypted message]';
    }
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService;
