# Installation Instructions for Notification & Messaging Features

## Quick Start

Follow these steps to get the updated Alonix mobile app running with the new notification and messaging features.

### Step 1: Install Dependencies

Run the following command in the project directory:

```bash
npm install
```

This will install the new dependency (`expo-device`) that was added to `package.json`.

### Step 2: Clear Cache (Recommended)

Clear the Metro bundler cache to ensure clean build:

```bash
npx expo start -c
```

Or on Windows using the batch file:

```bash
START_APP.bat
```

### Step 3: Test the Features

#### On Your Device:

1. **Install Expo Go** on your iOS or Android device
2. **Scan the QR code** displayed in the terminal
3. **Login** with any credentials (demo uses mock authentication)
4. **Explore the new features:**
   - Tap the **Messages** tab (new chatbubble icon)
   - Tap the **Activity** tab, then **Notifications**
   - Try sending messages
   - View unread badges on tabs

## New Files Created

### Context Providers (State Management)
- `src/context/NotificationsContext.js` - Manages notification state
- `src/context/MessagesContext.js` - Manages messaging state

### Screens (UI Components)
- `src/screens/NotificationsScreen.js` - Notifications list
- `src/screens/MessagesScreen.js` - Conversations list
- `src/screens/ConversationScreen.js` - Chat interface

### Services (Business Logic)
- `src/services/notificationService.js` - Push notification handling

### Updated Files
- `App.js` - Added NotificationsProvider and MessagesProvider
- `src/navigation/AppNavigator.js` - Added new screens and badge indicators
- `package.json` - Added expo-device dependency

## Testing Checklist

### Notifications
- [ ] View notifications grouped by date (Today, Yesterday, etc.)
- [ ] Mark individual notification as read
- [ ] Mark all notifications as read
- [ ] Delete individual notification
- [ ] Clear all notifications
- [ ] Tap notification to navigate to related content
- [ ] See unread badge on Activity tab

### Messages
- [ ] View all conversations
- [ ] Search conversations
- [ ] See online status indicators
- [ ] See unread message counts
- [ ] Tap conversation to open chat
- [ ] See unread badge on Messages tab

### Conversation (Chat)
- [ ] Send text message
- [ ] Send image from gallery
- [ ] Take photo and send
- [ ] See message timestamps
- [ ] See delivery and read receipts
- [ ] See typing indicator (simulated)
- [ ] Auto-scroll to latest messages

### Push Notifications (Physical Device Only)
- [ ] Grant notification permissions
- [ ] Receive local notification
- [ ] Tap notification to navigate
- [ ] See notification badge (iOS)

## Permissions Required

The app will request the following permissions:

### Android:
- Camera (for taking photos in chat)
- Storage (for selecting images from gallery)
- Notifications (for push notifications)

### iOS:
- Camera (for taking photos in chat)
- Photo Library (for selecting images)
- Notifications (for push notifications)

## Mock Data

The app includes mock data for demonstration:

### Notifications:
- 8 sample notifications of various types
- Mix of read and unread notifications
- Different timestamps for grouping demonstration

### Messages:
- 4 sample conversations
- Pre-populated chat messages
- Mix of read and unread messages
- Online/offline status examples

## Troubleshooting

### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

### Notifications not working

- Notifications require a **physical device**
- Ensure notification permissions are granted
- Check device notification settings

### Images not sending

- Grant camera and photo library permissions
- Check that expo-image-picker is properly installed
- Verify permissions in app.json

### Badge not showing

- Ensure you're logged in (mock login works)
- Check that context providers are properly set up in App.js
- Verify hooks are called inside functional components

## Next Steps

After testing the features:

1. **Integrate with Backend:** Replace mock data with real API calls
2. **Configure Push Notifications:** Set up backend for remote push notifications
3. **Customize Styling:** Adjust colors and styles in `src/constants/theme.js`
4. **Add Real-time Updates:** Implement WebSocket for live messaging
5. **Enhance Security:** Add message encryption

## Additional Resources

- See `NOTIFICATIONS_MESSAGES_GUIDE.md` for detailed documentation
- Review individual component files for inline comments
- Check Expo documentation for notifications: https://docs.expo.dev/versions/latest/sdk/notifications/

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify all dependencies are installed: `npm list`
3. Ensure you're using Expo SDK ~49.0.0
4. Review the guide documents for usage examples

---

**Setup Complete!** You should now be able to use all notification and messaging features in the Alonix mobile app.
