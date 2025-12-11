# Google API Key Setup

I have updated your mobile configuration (`app.json`) with the provided API keys. However, for the changes to take full effect, please follow these steps:

## 1. Mobile App
The API key `AIzaSyCr5jmlN6OwUoySOgklEEitfTpCEQZT274` is now configured in:
- `alonix-mobile/src/config/google.js`
- `alonix-mobile/app.json`

**Action Required:**
- **Restart your Metro Bundler** with clear cache to ensure the new configuration is loaded:
  ```bash
  npx expo start -c
  ```
- If you are running on a real device/emulator, reload the app.

## 2. Debugging "Hardcoded Places"
I have improved the error logging in `alonix-mobile/src/services/locationService.js`.
- If you still see hardcoded places (e.g. "Port Louis", "Grand Baie" only), check your terminal logs for `[LocationService]` errors.
- Common causes:
  - **Network Error:** The emulator might not have internet access.
  - **Billing:** Ensure your Google Cloud Project has Billing enabled (required for Places API).
  - **Quot/Limits:** Check if you've exceeded daily quotas. (Though your key worked in my test).

## 3. Backend Setup (Optional)
The backend currently does not appear to use Google Maps API features (it relies on the mobile app sending coordinates). However, if you want to enable future server-side features, you should update your backend environment variables.

**Action Required:**
Create or update `alonix-backend/.env` with:
```env
GOOGLE_MAPS_API_KEY=AIzaSyCr5jmlN6OwUoySOgklEEitfTpCEQZT274
```
(I could not do this automatically due to file permissions).

## 4. Search Screen Note
Note that the "Search" tab (`SearchScreen.js`) currently uses **mock data** for demonstration purposes. The **Book Ride** screen (`UberStyleRideScreen.js`) uses the **real** Google Places API. If you want the main Search tab to use real data, that requires a separate code update to switch from mock data to `locationService`.
