/**
 * ChatBubble.js
 * Reusable message bubble component with support for text, images, voice messages
 * Features: Long press menu, reactions, timestamps, read receipts
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ChatBubble = ({
  message,
  isOwnMessage,
  onLongPress,
  onReact,
  onReply,
  onDelete,
  onCopy,
  onForward,
  showAvatar = true,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bubbleRef = useRef(null);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLongPress = (event) => {
    const { pageX, pageY } = event.nativeEvent;

    bubbleRef.current?.measure((fx, fy, width, height, px, py) => {
      setMenuPosition({
        x: isOwnMessage ? px - 150 : px + width - 50,
        y: py - 50,
      });
      setMenuVisible(true);

      if (onLongPress) {
        onLongPress(message);
      }
    });
  };

  const handleMenuAction = (action) => {
    setMenuVisible(false);

    switch (action) {
      case 'reply':
        onReply && onReply(message);
        break;
      case 'copy':
        onCopy && onCopy(message);
        break;
      case 'forward':
        onForward && onForward(message);
        break;
      case 'delete':
        onDelete && onDelete(message);
        break;
      default:
        break;
    }
  };

  const handleReaction = (emoji) => {
    setMenuVisible(false);
    onReact && onReact(message.id, emoji);
  };

  const renderMessageContent = () => {
    if (message.deleted) {
      return (
        <View style={styles.deletedMessage}>
          <Ionicons name="ban-outline" size={14} color="#999" />
          <Text style={styles.deletedText}>{message.text}</Text>
        </View>
      );
    }

    switch (message.type) {
      case 'text':
        return (
          <View>
            {message.replyTo && (
              <View style={styles.replyPreview}>
                <View style={styles.replyLine} />
                <View style={styles.replyContent}>
                  <Text style={styles.replyName}>{message.replyTo.senderName}</Text>
                  <Text style={styles.replyText} numberOfLines={1}>
                    {message.replyTo.text}
                  </Text>
                </View>
              </View>
            )}
            <Text
              style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        );

      case 'image':
        return (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: message.imageUri }}
              style={styles.messageImage}
              resizeMode="cover"
            />
            {message.status === 'uploading' && (
              <View style={styles.uploadingOverlay}>
                <View style={styles.uploadProgress}>
                  <View
                    style={[
                      styles.uploadProgressBar,
                      { width: `${message.uploadProgress || 0}%` },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        );

      case 'voice':
        return (
          <View style={styles.voiceContainer}>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons
                name="play"
                size={20}
                color={isOwnMessage ? '#fff' : '#007AFF'}
              />
            </TouchableOpacity>
            <View style={styles.waveformContainer}>
              {renderWaveform(message.waveform)}
            </View>
            <Text
              style={[
                styles.voiceDuration,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {formatDuration(message.duration)}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const renderWaveform = (waveform = []) => {
    const bars = waveform.length > 0 ? waveform : Array(20).fill(0.3);
    return bars.map((height, index) => (
      <View
        key={index}
        style={[
          styles.waveformBar,
          {
            height: 20 * height,
            backgroundColor: isOwnMessage ? '#fff' : '#007AFF',
          },
        ]}
      />
    ));
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTimestamp = () => {
    const time = new Date(message.timestamp);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');

    return (
      <View style={styles.timestampContainer}>
        <Text
          style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
          ]}
        >
          {hours}:{minutes}
        </Text>
        {isOwnMessage && renderReadReceipt()}
      </View>
    );
  };

  const renderReadReceipt = () => {
    let iconName = 'checkmark';
    let color = '#B0B0B0';

    switch (message.status) {
      case 'sent':
        iconName = 'checkmark';
        color = '#B0B0B0';
        break;
      case 'delivered':
        iconName = 'checkmark-done';
        color = '#B0B0B0';
        break;
      case 'read':
        iconName = 'checkmark-done';
        color = '#4FC3F7';
        break;
      case 'sending':
        iconName = 'time-outline';
        color = '#B0B0B0';
        break;
      default:
        return null;
    }

    return <Ionicons name={iconName} size={14} color={color} style={styles.readIcon} />;
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) {
      return null;
    }

    // Group reactions by emoji
    const groupedReactions = message.reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = 0;
      }
      acc[reaction.emoji]++;
      return acc;
    }, {});

    return (
      <View
        style={[
          styles.reactionsContainer,
          isOwnMessage ? styles.ownReactions : styles.otherReactions,
        ]}
      >
        {Object.entries(groupedReactions).map(([emoji, count]) => (
          <View key={emoji} style={styles.reactionBubble}>
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
          </View>
        ))}
      </View>
    );
  };

  const renderLongPressMenu = () => {
    const reactions = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

    return (
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View
              style={[
                styles.menuContainer,
                {
                  top: menuPosition.y,
                  left: Math.max(10, Math.min(menuPosition.x, SCREEN_WIDTH - 210)),
                },
              ]}
            >
              {/* Quick Reactions */}
              <View style={styles.quickReactions}>
                {reactions.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.quickReactionButton}
                    onPress={() => handleReaction(emoji)}
                  >
                    <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Menu Actions */}
              <View style={styles.menuActions}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuAction('reply')}
                >
                  <Ionicons name="arrow-undo-outline" size={20} color="#333" />
                  <Text style={styles.menuItemText}>Reply</Text>
                </TouchableOpacity>

                {message.type === 'text' && !message.deleted && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleMenuAction('copy')}
                  >
                    <Ionicons name="copy-outline" size={20} color="#333" />
                    <Text style={styles.menuItemText}>Copy</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuAction('forward')}
                >
                  <Ionicons name="arrow-redo-outline" size={20} color="#333" />
                  <Text style={styles.menuItemText}>Forward</Text>
                </TouchableOpacity>

                {isOwnMessage && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleMenuAction('delete')}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        {
          transform: [
            { scale: scaleAnim },
            { translateX: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, isOwnMessage ? 50 : -50],
            })},
          ],
        },
      ]}
    >
      {!isOwnMessage && showAvatar && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {message.senderName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.bubbleContainer}>
        <TouchableOpacity
          ref={bubbleRef}
          activeOpacity={0.8}
          onLongPress={handleLongPress}
          style={[
            styles.bubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          {renderMessageContent()}
          {renderTimestamp()}
        </TouchableOpacity>

        {renderReactions()}
      </View>

      {renderLongPressMenu()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 12,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bubbleContainer: {
    maxWidth: '75%',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: '#999',
  },
  readIcon: {
    marginLeft: 2,
  },
  replyPreview: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  replyLine: {
    width: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadProgress: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  uploadProgressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30,
    marginRight: 8,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
    opacity: 0.7,
  },
  voiceDuration: {
    fontSize: 12,
  },
  deletedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletedText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    marginLeft: 6,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  ownReactions: {
    justifyContent: 'flex-end',
  },
  otherReactions: {
    justifyContent: 'flex-start',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
    fontWeight: '600',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  quickReactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  quickReactionButton: {
    padding: 4,
  },
  quickReactionEmoji: {
    fontSize: 24,
  },
  menuActions: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});

export default ChatBubble;
