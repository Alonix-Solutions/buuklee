# 🚀 Alonix Mobile App - Quick Setup Guide

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (v14 or newer)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Expo Go App** (on your phone)
   - iOS: Download from App Store
   - Android: Download from Google Play Store

---

## 📥 Installation Steps

### Step 1: Navigate to the project directory

```bash
cd C:\Users\Admin\Desktop\buuklee\alonix-mobile
```

### Step 2: Install dependencies

```bash
npm install
```

This will install all required packages including:
- React Native
- Expo
- React Navigation
- React Native Maps
- And all other dependencies

⏱️ This may take 2-5 minutes depending on your internet speed.

---

## 🏃 Running the App

### Step 3: Start the development server

```bash
npm start
```

or

```bash
expo start
```

This will:
- Start the Metro bundler
- Open Expo DevTools in your browser
- Display a QR code in your terminal

### Step 4: Run on your device

You have multiple options:

#### Option A: Run on Your Phone (Recommended for first time)

1. **Open Expo Go app** on your phone
2. **Scan the QR code** displayed in your terminal or browser:
   - **iOS**: Use the Camera app to scan
   - **Android**: Use the Expo Go app to scan
3. Wait for the app to build and load (first time may take 1-2 minutes)

#### Option B: Run on iOS Simulator (macOS only)

```bash
Press 'i' in the terminal
```

or

```bash
npm run ios
```

Requirements:
- macOS computer
- Xcode installed

#### Option C: Run on Android Emulator

```bash
Press 'a' in the terminal
```

or

```bash
npm run android
```

Requirements:
- Android Studio installed
- Android emulator configured

---

## 🎯 What to Expect

Once the app loads, you'll see:

1. **Home Screen** with:
   - Personalized greeting
   - Live challenge card
   - Quick action buttons
   - Featured challenges and clubs

2. **Bottom Navigation** with 5 tabs:
   - 🏠 Home
   - 🔍 Explore
   - ➕ Create (center button)
   - 🎯 Activity
   - 👤 Profile

3. **Interactive Features**:
   - Browse challenges, clubs, and hotels
   - View live tracking maps
   - Explore ride sharing options
   - Check user profile and stats

---

## 🎨 Exploring the App

### Try These Flows:

1. **Browse Challenges**
   - Go to Home → Tap any challenge card
   - View full details, route map, participants
   - See ride sharing options

2. **Live Tracking**
   - Go to Home → Tap the "LIVE NOW" card
   - See real-time map with participants
   - Toggle between stats and leaderboard

3. **Explore Hotels**
   - Go to Explore → Select "Hotels" tab
   - Browse hotel cards
   - Tap a hotel to see details and map

4. **View Profile**
   - Go to Profile tab
   - See stats, achievements, and activity breakdown

5. **Ride Sharing**
   - Go to Activity → "Ride Shares" tab
   - View available rides with cost splitting

---

## 🔧 Troubleshooting

### Issue: "npm install" fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Try installing again
npm install
```

### Issue: "Expo Go app can't connect"

**Solutions:**
- Make sure your phone and computer are on the same WiFi network
- Try restarting the development server
- Check if your firewall is blocking the connection
- Try using tunnel mode: `expo start --tunnel`

### Issue: Metro bundler fails to start

**Solution:**
```bash
# Clear Metro cache
npx expo start -c
```

### Issue: Maps not loading

**Note:** This is a prototype using mock maps. Maps should display but may not have all features of production maps.

### Issue: "Module not found" errors

**Solution:**
```bash
# Reinstall dependencies
npm install

# Clear cache and restart
npx expo start -c
```

---

## 📱 Testing on Different Devices

### iOS Testing
- iPhone 12 or newer recommended
- iOS 13 or newer
- Expo Go app from App Store

### Android Testing
- Android 5.0 (Lollipop) or newer
- Expo Go app from Google Play

---

## 🎨 Customizing Mock Data

Want to test with your own data?

Edit: `src/data/mockData.js`

You can modify:
- User profile and stats
- Challenges (add/remove/edit)
- Clubs
- Hotels
- Ride shares
- Posts

---

## 🚀 Performance Tips

For the best experience:

1. **Use a real device** rather than simulator when possible
2. **Close other apps** to free up memory
3. **Use good WiFi** for initial load
4. **Enable JavaScript debugging** only when needed (it slows down the app)

---

## 📚 Useful Commands

```bash
# Start development server
npm start

# Start with cache cleared
npx expo start -c

# Start in tunnel mode (if same WiFi doesn't work)
npx expo start --tunnel

# View in web browser (limited features)
npm run web

# Check for updates
npx expo-cli upgrade

# View logs
# Logs will appear in terminal after you scan QR code
```

---

## 🐛 Development Mode Features

When running in development mode, you can:

1. **Shake your device** to open the developer menu
2. **Enable Fast Refresh** - automatically reload when you save files
3. **Debug JS Remotely** - use Chrome DevTools for debugging
4. **Toggle Performance Monitor** - see FPS and memory usage

---

## ✅ Verify Installation

After starting the app, you should be able to:

- ✅ See the Home screen with featured content
- ✅ Navigate between tabs
- ✅ Tap on challenge cards to view details
- ✅ View maps with markers
- ✅ See smooth animations
- ✅ Browse through different sections

---

## 🎯 Next Steps

1. **Explore all screens** to understand the full flow
2. **Check the code structure** in the `src/` directory
3. **Read the main README.md** for full feature list
4. **Customize mock data** to test different scenarios
5. **Take screenshots** for presentations/demos

---

## 📧 Need Help?

If you encounter any issues:

1. Check this guide again
2. Read the error message carefully
3. Clear cache and restart: `npx expo start -c`
4. Reinstall dependencies: `rm -rf node_modules && npm install`
5. Check Expo documentation: https://docs.expo.dev/

---

## 🎉 Success!

If everything is working, you should now have:

- ✅ A running Alonix mobile app
- ✅ Smooth navigation between screens
- ✅ Interactive maps and components
- ✅ Beautiful UI matching the design specs

**Happy testing! 🚀**

---

*Last updated: November 2025*
