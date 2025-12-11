/**
 * LiveChatScreen.js
 * Modern real-time chat screen with WhatsApp/Telegram-style UI
 * Features: Auto-scroll, typing indicator, image/voice messages, emoji picker, reactions
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  Image,
  Alert,
  Clipboard,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ChatBubble from '../components/ChatBubble';
import chatService from '../services/ChatService';

const CHAT_ID = 'chat_001';
const CURRENT_USER_ID = 'user_001';
const CURRENT_USER_NAME = 'Me';
const OTHER_USER_ID = 'other_user';
const OTHER_USER_NAME = 'John Doe';

const LiveChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(true);
  const [otherUserLastSeen, setOtherUserLastSeen] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [connected, setConnected] = useState(false);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const scrollY = useRef(0);
  const typingAnimValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeChat();

    return () => {
      chatService.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (otherUserTyping) {
      startTypingAnimation();
    } else {
      stopTypingAnimation();
    }
  }, [otherUserTyping]);

  const initializeChat = async () => {
    // Connect to chat service
    await chatService.connect();
    setConnected(true);

    // Subscribe to messages
    chatService.onMessage((event, data) => {
      handleChatEvent(event, data);
    });

    // Subscribe to typing indicators
    chatService.onTyping((data) => {
      if (data.userId === OTHER_USER_ID) {
        setOtherUserTyping(data.isTyping);
      }
    });

    // Subscribe to status updates
    chatService.onStatus((data) => {
      if (data.userId === OTHER_USER_ID) {
        setOtherUserOnline(data.online);
        if (!data.online) {
          setOtherUserLastSeen(formatLastSeen(data.lastSeen));
        }
      }
    });

    // Load initial messages (demo data)
    loadDemoMessages();

    // Simulate incoming messages periodically
    startIncomingMessageSimulation();
  };

  const loadDemoMessages = () => {
    const demoMessages = [
      {
        id: 'msg_001',
        chatId: CHAT_ID,
        text: 'Hey! How are you doing?',
        type: 'text',
        senderId: OTHER_USER_ID,
        senderName: OTHER_USER_NAME,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'read',
        reactions: [],
        isIncoming: true,
      },
      {
        id: 'msg_002',
        chatId: CHAT_ID,
        text: "I'm doing great! Thanks for asking 😊",
        type: 'text',
        senderId: CURRENT_USER_ID,
        senderName: CURRENT_USER_NAME,
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        status: 'read',
        reactions: [{ emoji: '❤️', userId: OTHER_USER_ID, timestamp: Date.now() }],
        isIncoming: false,
      },
      {
        id: 'msg_003',
        chatId: CHAT_ID,
        text: 'That sounds awesome! When are you free to meet?',
        type: 'text',
        senderId: OTHER_USER_ID,
        senderName: OTHER_USER_NAME,
        timestamp: new Date(Date.now() - 3400000).toISOString(),
        status: 'read',
        reactions: [],
        isIncoming: true,
      },
    ];

    setMessages(demoMessages);
  };

  const startIncomingMessageSimulation = () => {
    // Simulate incoming messages every 30-60 seconds
    const simulateMessage = () => {
      if (Math.random() > 0.7) {
        chatService.simulateIncomingMessage(CHAT_ID, OTHER_USER_ID, OTHER_USER_NAME);
      }

      setTimeout(simulateMessage, 30000 + Math.random() * 30000);
    };

    setTimeout(simulateMessage, 30000);
  };

  const handleChatEvent = (event, data) => {
    switch (event) {
      case 'message:sent':
      case 'message:received':
        addOrUpdateMessage(data);
        scrollToBottom(true);
        break;

      case 'message:delivered':
      case 'message:read':
        updateMessageStatus(data);
        break;

      case 'message:reaction':
        updateMessage(data);
        break;

      case 'message:deleted':
        updateMessage(data);
        break;

      case 'message:upload-progress':
        updateMessage(data);
        break;

      default:
        break;
    }
  };

  const addOrUpdateMessage = (message) => {
    setMessages((prevMessages) => {
      const existingIndex = prevMessages.findIndex(m => m.id === message.id);
      if (existingIndex !== -1) {
        const updated = [...prevMessages];
        updated[existingIndex] = message;
        return updated;
      } else {
        return [message, ...prevMessages];
      }
    });
  };

  const updateMessageStatus = (message) => {
    setMessages((prevMessages) =>
      prevMessages.map((m) => (m.id === message.id ? { ...m, status: message.status } : m))
    );
  };

  const updateMessage = (message) => {
    setMessages((prevMessages) =>
      prevMessages.map((m) => (m.id === message.id ? message : m))
    );
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !replyToMessage) return;

    const messageData = {
      text: inputText.trim(),
      type: 'text',
      senderId: CURRENT_USER_ID,
      senderName: CURRENT_USER_NAME,
      replyTo: replyToMessage,
    };

    setInputText('');
    setReplyToMessage(null);
    scrollToBottom(true);

    await chatService.sendMessage(CHAT_ID, messageData);
  };

  const handleInputChange = (text) => {
    setInputText(text);

    // Send typing indicator
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      chatService.sendTypingIndicator(CHAT_ID, CURRENT_USER_ID, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      chatService.sendTypingIndicator(CHAT_ID, CURRENT_USER_ID, false);
    }, 2000);
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageData = {
          uri: result.assets[0].uri,
          senderId: CURRENT_USER_ID,
          senderName: CURRENT_USER_NAME,
        };

        await chatService.sendImage(CHAT_ID, imageData);
        scrollToBottom(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image pick error:', error);
    }
  };

  const handleCameraPick = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageData = {
          uri: result.assets[0].uri,
          senderId: CURRENT_USER_ID,
          senderName: CURRENT_USER_NAME,
        };

        await chatService.sendImage(CHAT_ID, imageData);
        scrollToBottom(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
  };

  const handleVoiceRecordStart = () => {
    setIsRecording(true);
    setRecordingDuration(0);

    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleVoiceRecordStop = async () => {
    setIsRecording(false);

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    if (recordingDuration < 1) {
      Alert.alert('Recording too short', 'Please record for at least 1 second');
      setRecordingDuration(0);
      return;
    }

    // Simulate voice message
    const voiceData = {
      uri: 'voice_recording.m4a',
      duration: recordingDuration,
      waveform: Array(20).fill(0).map(() => Math.random()),
      senderId: CURRENT_USER_ID,
      senderName: CURRENT_USER_NAME,
    };

    await chatService.sendVoiceMessage(CHAT_ID, voiceData);
    setRecordingDuration(0);
    scrollToBottom(true);
  };

  const handleReaction = (messageId, emoji) => {
    chatService.addReaction(messageId, emoji, CURRENT_USER_ID);
  };

  const handleReply = (message) => {
    setReplyToMessage(message);
  };

  const handleCopy = (message) => {
    if (message.text) {
      Clipboard.setString(message.text);
      Alert.alert('Copied', 'Message copied to clipboard');
    }
  };

  const handleForward = (message) => {
    Alert.alert('Forward', 'Forward message functionality');
  };

  const handleDelete = (message) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => chatService.deleteMessage(message.id),
        },
      ]
    );
  };

  const handleEmojiSelect = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const scrollToBottom = (animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated });
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.current = offsetY;
    setShowScrollButton(offsetY > 500);
  };

  const startTypingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnimValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopTypingAnimation = () => {
    typingAnimValue.setValue(0);
  };

  const formatLastSeen = (lastSeenDate) => {
    const date = new Date(lastSeenDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const formatRecordingDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.senderId === CURRENT_USER_ID;
    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].senderId !== item.senderId);

    return (
      <ChatBubble
        message={item}
        isOwnMessage={isOwnMessage}
        showAvatar={showAvatar}
        onReact={handleReaction}
        onReply={handleReply}
        onCopy={handleCopy}
        onForward={handleForward}
        onDelete={handleDelete}
      />
    );
  };

  const renderTypingIndicator = () => {
    if (!otherUserTyping) return null;

    const dot1Opacity = typingAnimValue.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.3, 1, 0.3, 0.3],
    });

    const dot2Opacity = typingAnimValue.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.3, 0.3, 1, 0.3],
    });

    const dot3Opacity = typingAnimValue.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.3, 0.3, 0.3, 1],
    });

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Animated.View style={[styles.typingDot, { opacity: dot1Opacity }]} />
          <Animated.View style={[styles.typingDot, { opacity: dot2Opacity }]} />
          <Animated.View style={[styles.typingDot, { opacity: dot3Opacity }]} />
        </View>
      </View>
    );
  };

  const renderEmojiPicker = () => {
    const emojis = [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
      '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
      '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    ];

    return (
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity
          style={styles.emojiPickerOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.emojiPickerContainer}>
            <View style={styles.emojiPickerHeader}>
              <Text style={styles.emojiPickerTitle}>Select Emoji</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.emojiGrid}>
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => handleEmojiSelect(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderReplyPreview = () => {
    if (!replyToMessage) return null;

    return (
      <View style={styles.replyPreviewContainer}>
        <View style={styles.replyPreviewContent}>
          <View style={styles.replyPreviewLine} />
          <View style={styles.replyPreviewText}>
            <Text style={styles.replyPreviewName}>{replyToMessage.senderName}</Text>
            <Text style={styles.replyPreviewMessage} numberOfLines={1}>
              {replyToMessage.text}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setReplyToMessage(null)}
          style={styles.replyPreviewClose}
        >
          <Ionicons name="close" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.headerAvatarContainer}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{OTHER_USER_NAME.charAt(0)}</Text>
            </View>
            {otherUserOnline && <View style={styles.onlineIndicator} />}
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{OTHER_USER_NAME}</Text>
            <Text style={styles.headerStatus}>
              {otherUserOnline ? 'Online' : `Last seen ${otherUserLastSeen}`}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.messagesList}
          ListHeaderComponent={renderTypingIndicator}
        />

        {showScrollButton && (
          <TouchableOpacity
            style={styles.scrollToBottomButton}
            onPress={() => scrollToBottom(true)}
          >
            <Ionicons name="chevron-down" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {renderReplyPreview()}

          {isRecording ? (
            <View style={styles.recordingContainer}>
              <TouchableOpacity
                onPress={handleVoiceRecordStop}
                style={styles.recordingCancel}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>

              <View style={styles.recordingInfo}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingDuration}>
                  {formatRecordingDuration(recordingDuration)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleVoiceRecordStop}
                style={styles.recordingSend}
              >
                <Ionicons name="send" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TouchableOpacity
                onPress={() => setShowEmojiPicker(true)}
                style={styles.inputButton}
              >
                <Ionicons name="happy-outline" size={24} color="#999" />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={handleInputChange}
                multiline
                maxLength={1000}
              />

              {inputText.trim() ? (
                <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                  <Ionicons name="send" size={24} color="#fff" />
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handleCameraPick}
                    style={styles.inputButton}
                  >
                    <Ionicons name="camera-outline" size={24} color="#999" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleImagePick}
                    style={styles.inputButton}
                  >
                    <Ionicons name="image-outline" size={24} color="#999" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPressIn={handleVoiceRecordStart}
                    style={styles.inputButton}
                  >
                    <Ionicons name="mic-outline" size={24} color="#999" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {renderEmojiPicker()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    right: 10,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesList: {
    paddingVertical: 12,
  },
  typingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  replyPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  replyPreviewContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyPreviewLine: {
    width: 3,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 2,
    marginRight: 8,
  },
  replyPreviewText: {
    flex: 1,
  },
  replyPreviewName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 2,
  },
  replyPreviewMessage: {
    fontSize: 14,
    color: '#666',
  },
  replyPreviewClose: {
    padding: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  recordingCancel: {
    padding: 8,
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordingSend: {
    padding: 8,
  },
  emojiPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiPickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  emojiButton: {
    width: '12.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
});

export default LiveChatScreen;
