import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';
import { useMessages } from '../context/MessagesContext';
import moment from 'moment';

const MessagesScreen = ({ navigation }) => {
  const {
    conversations,
    isLoading,
    totalUnreadCount,
    deleteConversation,
    searchConversations,
  } = useMessages();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchConversations(searchQuery);
      setFilteredConversations(results);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in real app, fetch from API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleConversationPress = (conversation) => {
    navigation.navigate('Conversation', {
      conversationId: conversation.id,
      participant: conversation.participants[0],
    });
  };

  const handleDeleteConversation = (conversationId) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteConversation(conversationId);
          },
        },
      ]
    );
  };

  const formatTime = (timestamp) => {
    const messageTime = moment(timestamp);
    const now = moment();
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');

    if (messageTime.isSame(today, 'day')) {
      return messageTime.format('h:mm A');
    } else if (messageTime.isSame(yesterday, 'day')) {
      return 'Yesterday';
    } else if (messageTime.isAfter(now.subtract(7, 'days'))) {
      return messageTime.format('ddd');
    } else {
      return messageTime.format('MM/DD/YY');
    }
  };

  const renderConversation = ({ item }) => {
    const participant = item.participants[0];
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.conversationContent}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: participant.avatar }}
              style={styles.avatar}
            />
            {participant.online && <View style={styles.onlineIndicator} />}
          </View>

          {/* Content */}
          <View style={styles.messageContent}>
            <View style={styles.headerRow}>
              <Text
                style={[styles.participantName, hasUnread && styles.unreadText]}
                numberOfLines={1}
              >
                {participant.name}
              </Text>
              <Text style={styles.timestamp}>
                {formatTime(item.lastMessageTime)}
              </Text>
            </View>

            <View style={styles.messageRow}>
              <Text
                style={[
                  styles.lastMessage,
                  hasUnread && styles.unreadText,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage || 'No messages yet'}
              </Text>
              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {item.unreadCount > 9 ? '9+' : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteConversation(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={80} color={COLORS.lightGray} />
      <Text style={styles.emptyTitle}>No Messages</Text>
      <Text style={styles.emptyMessage}>
        Start a conversation with your friends and connect with the community!
      </Text>
    </View>
  );

  const renderSearchEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={80} color={COLORS.lightGray} />
      <Text style={styles.emptyTitle}>No Results Found</Text>
      <Text style={styles.emptyMessage}>
        Try searching with different keywords
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {totalUnreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{totalUnreadCount}</Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={COLORS.gray}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        searchQuery.trim() ? renderSearchEmptyState() : renderEmptyState()
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.black,
  },
  headerBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SIZES.margin,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.black,
  },
  listContent: {
    paddingBottom: SIZES.padding,
  },
  conversationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.margin,
    marginVertical: 4,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  conversationContent: {
    flexDirection: 'row',
    padding: SIZES.padding,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SIZES.margin / 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.lightGray,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  messageContent: {
    flex: 1,
    marginRight: SIZES.margin / 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    flex: 1,
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  timestamp: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  unreadText: {
    fontWeight: '700',
    color: COLORS.black,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin / 2,
  },
  emptyMessage: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default MessagesScreen;
