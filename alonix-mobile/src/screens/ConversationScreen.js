import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

const ConversationScreen = ({ route, navigation }) => {
  const { conversationId, participant } = route.params || {};
  const { user } = useAuth();
  const {
    getMessages,
    sendMessage,
    markConversationAsRead,
  } = useMessages();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Set header title
    if (participant) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <Image source={{ uri: participant.avatar }} style={styles.headerAvatar} />
            <View>
              <Text style={styles.headerName}>{participant.name}</Text>
              {participant.online && (
                <Text style={styles.headerStatus}>Online</Text>
              )}
            </View>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              // Navigate to participant profile or options
              Alert.alert('More Options', 'Feature coming soon');
            }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.white} />
          </TouchableOpacity>
        ),
      });
    }

    if (conversationId) {
      loadMessages();
      markConversationAsRead(conversationId);
    }
  }, [conversationId, participant]);

  // Simulate typing indicator
  useEffect(() => {
    if (inputText.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [inputText]);

  const loadMessages = () => {
    const conversationMessages = getMessages(conversationId);
    setMessages(conversationMessages);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    const result = await sendMessage(conversationId, messageText);

    if (result.success) {
      loadMessages();
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      Alert.alert('Error', 'Failed to send message');
    }

    setIsSending(false);
  };

  const handlePickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to send images'
      );
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setIsSending(true);

      const sendResult = await sendMessage(conversationId, 'Image', imageUri);

      if (sendResult.success) {
        loadMessages();
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', 'Failed to send image');
      }

      setIsSending(false);
    }
  };

  const handleTakePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos'
      );
      return;
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setIsSending(true);

      const sendResult = await sendMessage(conversationId, 'Image', imageUri);

      if (sendResult.success) {
        loadMessages();
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', 'Failed to send image');
      }

      setIsSending(false);
    }
  };

  const handleImageOptions = () => {
    Alert.alert(
      'Send Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const formatMessageTime = (timestamp) => {
    const messageTime = moment(timestamp);
    const now = moment();
    const today = moment().startOf('day');

    if (messageTime.isSame(today, 'day')) {
      return messageTime.format('h:mm A');
    } else {
      return messageTime.format('MMM D, h:mm A');
    }
  };

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.senderId === user.id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !isOwnMessage && (
      !previousMessage ||
      previousMessage.senderId !== item.senderId ||
      moment(item.timestamp).diff(moment(previousMessage.timestamp), 'minutes') > 5
    );

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <Image
                source={{ uri: participant.avatar }}
                style={styles.messageAvatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {item.imageUri && (
            <Image
              source={{ uri: item.imageUri }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          {item.text && item.text !== 'Image' && (
            <Text
              style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {item.text}
            </Text>
          )}
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
              ]}
            >
              {formatMessageTime(item.timestamp)}
            </Text>
            {isOwnMessage && (
              <Ionicons
                name={item.read ? 'checkmark-done' : item.delivered ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={item.read ? COLORS.info : COLORS.white}
                style={{ marginLeft: 4, opacity: 0.7 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <Image
          source={{ uri: participant.avatar }}
          style={styles.messageAvatar}
        />
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleImageOptions}
          disabled={isSending}
        >
          <Ionicons name="camera" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.gray}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isSending}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="send" size={20} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: COLORS.lightGray,
  },
  headerName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerStatus: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    opacity: 0.8,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  messagesContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    marginHorizontal: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
  },
  messageBubble: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding / 2,
    maxWidth: '100%',
  },
  ownMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    ...SHADOW_SMALL,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: SIZES.borderRadius / 2,
    marginBottom: 4,
  },
  messageText: {
    fontSize: SIZES.md,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.black,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: SIZES.xs,
  },
  ownMessageTime: {
    color: COLORS.white,
    opacity: 0.7,
  },
  otherMessageTime: {
    color: COLORS.gray,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    marginLeft: 8,
  },
  typingBubble: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding / 2,
    marginLeft: 8,
    ...SHADOW_SMALL,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,

    borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
    borderRadius: SIZES.borderRadius * 2,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: SIZES.md,
    color: COLORS.black,
    minHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
});

export default ConversationScreen;
