# SoulThread Handoff Documentation

Welcome to the SoulThread codebase! This document outlines the recent major changes, architecture, and current status of the platform to help you onboard quickly.

## Recent Major Updates

### 1. The Mutual Connection System
We transitioned the platform from a one-way "Follow" model (like Twitter) to a mutual two-way "Connection" model (like LinkedIn/Instagram close friends).
- **Logic:** When a user clicks "Connect", it sends a `connection_request`. The target user must "Accept" it for both users to be added to each other's `connections` array.
- **UI:** The Profile stats now represent "Requested" (pending requests sent) and "Connected" (mutual connections).
- **Data Structure:** `users` documents in Firestore now utilize `connections`, `sentRequests`, and `pendingRequests` arrays instead of `followers` and `following`.

### 2. Navigation Clean-up
- Removed the "Series" tab from the bottom and top navigation bars to streamline the app.
- Replaced it with a direct link to "Messages" (`/messages`) with the appropriate icon.

### 3. Connect Modal Restored
- Re-enabled the `ConnectModal` on the `Profile.jsx` page. Users can now attach a custom text note when they send a connection request, which is passed along in the notification.

## Build and Deployment

### Web Build
The web platform uses Vite and React.
- **Run Locally:** `npm run dev`
- **Build:** `npm run build:user`

### Android App Build
The Android app uses Capacitor to wrap the Vite web build.
- **Sync Code:** `npx cap sync android`
- **Build APK:** `cd android && .\gradlew assembleDebug`
*(The APK will be output to `android/app/build/outputs/apk/debug/app-debug.apk`)*

## Current Known Issues / Next Steps
- **Followers/Following Lists:** Clicking the stat numbers on the Profile page currently does nothing (the links were disabled to prevent 404 crashes). **Next Step:** A UI modal or dedicated route (`/connections/:userId`) needs to be designed and built if we want users to see a list of their connections.
- **Notifications:** Ensure Firebase Cloud Messaging (FCM) is properly configured if push notifications are required on native Android.

Good luck with development!
