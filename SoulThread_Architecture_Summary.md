# SoulThread Application Architecture & Overview

## 1. Purpose and Vision
SoulThread is designed to be a comprehensive platform for mental wellness, community support, and personal growth. Its purpose is to provide a safe space for users to explore various facets of mental health through community engagement, expert support, immersive guided series, and dedicated support groups (circles).

## 2. What Has Been Built

### Core Application Structure
- **Framework**: React with Vite for blazing fast development and build times.
- **Cross-Platform Mobile Integration**: Capacitor (v8) is used to wrap the React web app into native Android (and potentially iOS) applications. This allows a single codebase to serve the web and native mobile environments.
- **Routing**: Client-side routing via `react-router-dom` with lazy-loading for nearly all routes to improve initial load performance.
- **Authentication**: Powered by Firebase Authentication, specifically integrating Google Sign-In and Phone Number login natively using the `@capacitor-firebase/authentication` plugin.

### Key Features & Components
1. **User Authentication & Profiles**
   - Support for Google and Phone number authentication.
   - User profiles with personalized feeds and activity tracking.
   - Dedicated dashboard for Admins and Guides/Experts.

2. **Community & Feed**
   - **Home / Explore**: Users can view posts, discover new content, and engage with the community.
   - **Post Details**: Deep linking into specific posts.
   - **Chat**: Real-time messaging and communication between users.

3. **Support Groups & Circles**
   - Users can join dedicated "Groups" or "Circles" based on specific mental health focuses (e.g., Support Groups, Wellness Network, Healing Hub).

4. **Expert & Guide System**
   - Users can discover Experts and Guides.
   - **Care Assistant**: An integrated interface for users seeking directed care or guidance.
   - Professionals can sign up via "Join As Expert" / "Join Guide" flows.

5. **Immersive Audio/Visual Series**
   - Highly specialized, immersive full-screen series including: *Hyperfocus Series*, *Never Finished Series*, *Biological Soul Series*, *Meditation Series*, *Ego Id Series*, *Memory Series*, and *Lust Decoded*.
   - These are built as distinct standalone experiences hiding the standard navigation elements to enhance user immersion.

6. **Native Device Features (Capacitor Plugins)**
   - **Camera / Filesystem**: For users to upload avatars and share media.
   - **Local & Push Notifications**: Engaging users via real-time alerts.
   - **Splash Screen & Status Bar**: Native-feeling app loading and UI aesthetics tailored to Android.

## 3. Key Strategies Used

### Progressive Web App & Native Hybrid (Write Once, Run Anywhere)
Instead of building a separate Kotlin/Java Android app and a React Web App, the project strategically uses Capacitor. The core UI logic is written entirely in React and JavaScript. Capacitor bridges the gap to native Android APIs (camera, notifications, file system). 

### Performance & Lazy Loading
Code splitting is implemented out of the box in `App.jsx`. Every major page (Home, Auth, Profile, Chat, Immersive Series) is `lazy`-loaded. This strategy minimizes the initial JavaScript payload size, meaning the app boots up extremely fast. After the initial paint, critical routes are intelligently pre-fetched in idle time.

### Context-Aware UI (Web vs Native)
The application detects whether it is running on the web or as a native app using `Capacitor.isNativePlatform()`. CSS classes (`.native-app` vs `.web-app`) are applied to the body to dynamically adjust styling, handling things like safe-area insets for mobile devices natively.

### Immersive Focus Modes
For series-based content (e.g., Hyperfocus, Meditation), the global navigation and footer are dynamically removed from the App Shell. This strategy aims to reduce cognitive load and distractions, fostering an environment where users can engage deeply with mental health and guided content.

### Scalable Backend via Firebase
The platform leverages Firebase heavily for:
- Database & Rules (Firestore)
- Secure Storage (Storage Rules)
- User Authentication (Firebase Auth)
- Hosting & Deployments (`firebase.json`)

### Code Modularity
The codebase follows standard React modularity:
- `/components` for reusable UI (e.g., Navbar, Footer, Loading).
- `/pages` for distinct route layouts.
- `/services` for API, performance monitoring, and upload pipelines.
- `/contexts` for global state (e.g., `AuthContext`).

## 4. Next Steps for Developer Hand-off

A complete zip file containing the source code (`src/`, `android/`, `package.json`, configuration files) has been generated at `C:\Users\ojhar\soulthread_source_code.zip`.

**Instructions for the Developer:**
1. Extract `soulthread_source_code.zip`.
2. Ensure Node.js (v18+) and Android Studio are installed.
3. Run `npm install` to restore `node_modules`.
4. Run `npm run dev` to start the web local server.
5. To test Android locally, build the web output (`npm run build`), synchronize with Capacitor (`npx cap sync android`), and open Android Studio (`npx cap open android`). 
6. Any environment variables (`.env`) for Firebase or other services will need to be configured.

Please review this document to understand the architectural decisions before proceeding with new changes.
