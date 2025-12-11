# Notification and Messaging Features Guide

## Overview

This document provides a comprehensive guide to the notification and messaging features implemented in the Alonix mobile app. These features enable real-time communication between users and keep them informed about important events and updates.

## Table of Contents

1. [Features Implemented](#features-implemented)
2. [File Structure](#file-structure)
3. [Context Providers](#context-providers)
4. [Screens](#screens)
5. [Services](#services)
6. [Usage Examples](#usage-examples)
7. [Installation](#installation)
8. [Configuration](#configuration)

---

## Features Implemented

### 1. Notifications System
- **In-app notifications** with multiple types
- **Grouped notifications** by time (Today, Yesterday, This Week, Older)
- **Unread notification tracking** with badge indicators
- **Mark as read/unread** functionality
- **Delete individual or all notifications**
- **Navigate to related content** based on notification type
- **Real-time badge updates** on tab bar

### 2. Messaging System
- **One-on-one conversations**
- **Real-time message display**
- **Unread message count** per conversation and total
- **Message search** functionality
- **Online status indicators**
- **Message timestamps** with smart formatting
- **Image sharing** via camera or gallery
- **Typing indicators** (simulated)
- **Message delivery and read receipts**

### 3. Push Notifications
- **Local notifications** using Expo Notifications
- **Scheduled notifications** (immediate, delayed, daily)
- **Push notification permissions** handling
- **Notification badge management** (iOS)
- **Predefined notification templates**
- **Background notification handling**

---

## File Structure

```
src/
├── context/
│   ├── NotificationsContext.js    # Notification state management
│   └── MessagesContext.js         # Messaging state management
├── screens/
│   ├── NotificationsScreen.js     # Notifications list view
│   ├── MessagesScreen.js          # Conversations list view
│   └── ConversationScreen.js      # Individual chat interface
├── services/
│   └── notificationService.js     # Push notification handling
└── navigation/
    └── AppNavigator.js            # Updated with new screens and badge indicators
```

---

## Context Providers

### NotificationsContext

**Location:** `src/context/NotificationsContext.js`

**State:**
- `notifications` - Array of notification objects
- `unreadCount` - Number of unread notifications
- `isLoading` - Loading state

**Methods:**
- `getNotifications()` - Get all notifications
- `getUnreadNotifications()` - Get only unread notifications
- `getGroupedNotifications()` - Get notifications grouped by date
- `markAsRead(notificationId)` - Mark a notification as read
- `markAllAsRead()` - Mark all notifications as read
- `deleteNotification(notificationId)` - Delete a notification
- `clearAllNotifications()` - Clear all notifications
- `addNotification(notification)` - Add a new notification

**Notification Types:**
- `CHALLENGE_INVITE` - Challenge invitation
- `BOOKING_CONFIRM` - Booking confirmation
- `MESSAGE` - New message notification
- `ACHIEVEMENT` - Achievement unlocked
- `FRIEND_REQUEST` - Friend request
- `RIDE_UPDATE` - Ride status update
- `CLUB_INVITE` - Club invitation
- `SYSTEM` - System notifications

**Notification Object Structure:**
```javascript
{
  id: string,
  type: NotificationType,
  title: string,
  message: string,
  timestamp: ISO string,
  read: boolean,
  data: object // Additional data for navigation
}
```

### MessagesContext

**Location:** `src/context/MessagesContext.js`

**State:**
- `conversations` - Array of conversation objects
- `messages` - Object mapping conversationId to messages array
- `totalUnreadCount` - Total unread messages across all conversations
- `isLoading` - Loading state

**Methods:**
- `getConversations()` - Get all conversations sorted by last message time
- `getConversation(conversationId)` - Get specific conversation
- `getMessages(conversationId)` - Get messages for a conversation
- `sendMessage(conversationId, text, imageUri)` - Send a text or image message
- `markMessageAsRead(conversationId, messageId)` - Mark message as read
- `markConversationAsRead(conversationId)` - Mark all messages in conversation as read
- `createConversation(participant)` - Create new conversation
- `deleteConversation(conversationId)` - Delete a conversation
- `searchConversations(query)` - Search conversations by participant name or message content

**Conversation Object Structure:**
```javascript
{
  id: string,
  participants: [
    {
      id: string,
      name: string,
      avatar: string,
      online: boolean
    }
  ],
  lastMessage: string,
  lastMessageTime: ISO string,
  unreadCount: number
}
```

**Message Object Structure:**
```javascript
{
  id: string,
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  imageUri: string (optional),
  timestamp: ISO string,
  read: boolean,
  delivered: boolean
}
```

---

## Screens

### NotificationsScreen

**Location:** `src/screens/NotificationsScreen.js`

**Features:**
- Grouped notification display (Today, Yesterday, This Week, Older)
- Pull-to-refresh
- Mark all as read
- Clear all notifications
- Delete individual notifications
- Navigate to related content based on notification type
- Empty state with helpful message
- Unread indicators
- Icon-based notification types with colors

**Navigation:**
- Accessible from Activity tab
- Navigates to relevant screens based on notification type

### MessagesScreen

**Location:** `src/screens/MessagesScreen.js`

**Features:**
- List of all conversations
- Search conversations by name or message
- Unread message badges
- Online status indicators
- Last message preview
- Smart timestamp formatting
- Delete conversations
- Empty state for no messages
- Pull-to-refresh

**Navigation:**
- New dedicated Messages tab in bottom navigation
- Navigates to ConversationScreen

### ConversationScreen

**Location:** `src/screens/ConversationScreen.js`

**Features:**
- Real-time chat interface
- Send text messages
- Send images (camera or gallery)
- Message bubbles with sender distinction
- Message timestamps
- Typing indicators
- Read/delivered receipts
- Auto-scroll to latest message
- Participant info in header
- Online status in header

**Permissions Required:**
- Camera access (for taking photos)
- Photo library access (for selecting images)

---

## Services

### notificationService

**Location:** `src/services/notificationService.js`

**Features:**
- Request notification permissions
- Get Expo push token
- Schedule local notifications
- Schedule delayed notifications
- Schedule daily notifications
- Cancel notifications
- Manage notification badge (iOS)
- Notification listeners
- Predefined notification templates

**Methods:**

```javascript
// Request permissions
await notificationService.requestPermissions();

// Get push token
const token = await notificationService.getExpoPushToken();

// Schedule immediate notification
await notificationService.scheduleLocalNotification({
  title: 'Hello',
  body: 'This is a notification',
  data: { key: 'value' }
});

// Schedule delayed notification (in seconds)
await notificationService.scheduleDelayedNotification({
  title: 'Reminder',
  body: 'Don\'t forget!'
}, 60);

// Schedule daily notification (hour, minute)
await notificationService.scheduleDailyNotification({
  title: 'Daily Reminder',
  body: 'Stay active!'
}, 9, 0); // 9:00 AM daily

// Cancel notification
await notificationService.cancelNotification(notificationId);

// Set badge count (iOS)
await notificationService.setBadgeCount(5);

// Add listeners
notificationService.addNotificationReceivedListener((notification) => {
  console.log('Notification received:', notification);
});

notificationService.addNotificationResponseListener((response) => {
  console.log('Notification tapped:', response);
  // Navigate based on notification data
});
```

**Predefined Templates:**

```javascript
// Challenge invite
notificationService.notifications.challengeInvite('Marathon 2024', 'Sarah');

// Booking confirmation
notificationService.notifications.bookingConfirm('hotel', 'Grand Plaza');

// New message
notificationService.notifications.newMessage('Mike', 'Are you ready?');

// Achievement
notificationService.notifications.achievement('Century Rider', '100km cycling');

// Friend request
notificationService.notifications.friendRequest('Alex Martinez');

// Ride update
notificationService.notifications.rideUpdate('Driver Arriving', '2 minutes away');

// Club invite
notificationService.notifications.clubInvite('City Cyclists');

// Activity reminder
notificationService.notifications.activityReminder();
```

---

## Usage Examples

### Adding a Notification Programmatically

```javascript
import { useNotifications } from '../context/NotificationsContext';

const MyComponent = () => {
  const { addNotification } = useNotifications();

  const handleAction = async () => {
    await addNotification({
      type: 'ACHIEVEMENT',
      title: 'Achievement Unlocked!',
      message: 'You completed your first challenge',
      data: {
        achievementId: 'first-challenge',
      }
    });
  };

  return <Button onPress={handleAction} title="Unlock Achievement" />;
};
```

### Sending a Message

```javascript
import { useMessages } from '../context/MessagesContext';

const ChatComponent = () => {
  const { sendMessage } = useMessages();

  const handleSend = async (conversationId, text) => {
    const result = await sendMessage(conversationId, text);
    if (result.success) {
      console.log('Message sent!');
    }
  };

  return <Button onPress={() => handleSend('conv1', 'Hello!')} title="Send" />;
};
```

### Checking Unread Counts

```javascript
import { useNotifications } from '../context/NotificationsContext';
import { useMessages } from '../context/MessagesContext';

const BadgeComponent = () => {
  const { unreadCount } = useNotifications();
  const { totalUnreadCount } = useMessages();

  return (
    <View>
      <Text>Unread Notifications: {unreadCount}</Text>
      <Text>Unread Messages: {totalUnreadCount}</Text>
    </View>
  );
};
```

### Scheduling a Push Notification

```javascript
import notificationService from '../services/notificationService';

const ScheduleComponent = () => {
  const scheduleReminder = async () => {
    // Request permissions first
    const { success } = await notificationService.requestPermissions();

    if (success) {
      // Schedule notification in 10 seconds
      await notificationService.scheduleDelayedNotification({
        title: 'Workout Reminder',
        body: 'Time for your daily workout!',
        data: { screen: 'Activity' }
      }, 10);
    }
  };

  return <Button onPress={scheduleReminder} title="Schedule Reminder" />;
};
```

---

## Installation

### 1. Install Dependencies

The necessary packages have been added to `package.json`. Install them by running:

```bash
npm install
```

Or with Expo:

```bash
npx expo install expo-device expo-notifications expo-image-picker
```

### 2. Configure App.json

Add notification configuration to your `app.json`:

```json
{
  "expo": {
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#4F46E5",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to take photos for messages.",
        "NSPhotoLibraryUsageDescription": "This app accesses your photos to send images in messages."
      }
    }
  }
}
```

### 3. Test on Physical Device

Push notifications require a physical device. They will not work on simulators/emulators.

---

## Configuration

### Notification Settings

Customize notification behavior in `src/services/notificationService.js`:

```javascript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // Show alert
    shouldPlaySound: true,       // Play sound
    shouldSetBadge: true,        // Update badge
  }),
});
```

### Mock Data

Both contexts come with mock data for demonstration. To disable mock data and use real API:

1. **NotificationsContext:** Remove `generateMockNotifications()` call
2. **MessagesContext:** Remove `generateMockConversations()` call
3. Implement API calls in the respective methods

### Styling

Colors and sizes are imported from `src/constants/theme.js`. Customize there to change the appearance globally.

---

## Tab Bar Badge Indicators

The app now shows visual indicators for unread items:

- **Messages Tab:** Shows a red dot when there are unread messages
- **Activity Tab:** Shows a red dot when there are unread notifications

The badge appears as a small red dot with a white center on the tab icon.

---

## Navigation Flow

### Notifications Flow:
```
Activity Tab → Notifications Screen → (Navigate to related content)
```

### Messages Flow:
```
Messages Tab → Messages Screen → Conversation Screen
```

### Cross-Navigation:
- Tapping a message notification navigates to the Conversation Screen
- Tapping other notifications navigates to relevant screens (Challenge Detail, Hotel Detail, etc.)

---

## Best Practices

1. **Request Permissions Early:** Request notification permissions during onboarding or first use
2. **Handle Permission Denial:** Provide clear messaging if permissions are denied
3. **Batch Notifications:** Don't overwhelm users with too many notifications
4. **Clear Notifications:** Clear notifications when user views the related content
5. **Test on Device:** Always test push notifications on a physical device
6. **Handle Background State:** Properly handle notifications when app is backgrounded
7. **Optimize Images:** Compress images before sending in messages
8. **Pagination:** Implement pagination for large conversation lists (future enhancement)
9. **Real-time Updates:** Consider WebSocket integration for real-time messaging (future enhancement)

---

## Future Enhancements

1. **Group Chats:** Support for multi-participant conversations
2. **Voice Messages:** Audio message support
3. **Video Calls:** Integrate video calling
4. **Message Reactions:** Add emoji reactions to messages
5. **Message Forwarding:** Forward messages between conversations
6. **Rich Notifications:** Include images in push notifications
7. **Notification Preferences:** User-configurable notification settings
8. **Message Encryption:** End-to-end encryption for messages
9. **Read Receipts Toggle:** Allow users to disable read receipts
10. **Archive Conversations:** Archive instead of delete

---

## Troubleshooting

### Notifications Not Showing

1. Check device notification permissions
2. Verify app is running on physical device (not simulator)
3. Check notification handler configuration
4. Review console logs for errors

### Messages Not Sending

1. Check AsyncStorage permissions
2. Verify context providers are properly wrapped in App.js
3. Check for JavaScript errors in console
4. Ensure conversation exists before sending

### Badge Not Updating

1. Verify context providers are at the correct level
2. Check that hooks are called inside functional components
3. Review state updates in contexts

---

## Support

For issues or questions:
1. Check the console for error messages
2. Review the mock data implementation for examples
3. Verify all dependencies are installed correctly
4. Ensure you're testing on a supported Expo version

---

**Last Updated:** November 12, 2024
**Version:** 1.0.0
**Expo SDK:** ~49.0.0
