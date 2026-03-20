---
description: Deploy SoulThread to soulthread.in (Firebase Hosting + Android sync)
---

This workflow deploys the latest code to https://soulthread.in and syncs the Android project.

## Steps

1. Build the production bundle:
```
npm run build
```

2. Deploy to Firebase Hosting (updates both soulthread.in AND soulthread-15a72.web.app automatically):
```
firebase deploy --only hosting
```

3. Sync the Android project with the new build:
```
npx cap sync android
```

> After step 3, open Android Studio and run on a device/emulator to test, or generate a signed APK/bundle for the Play Store.
