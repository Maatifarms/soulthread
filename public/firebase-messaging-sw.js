importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBcpOg9-ZKbEDkPGI3hHlrvekwh4PPHrCY",
    authDomain: "soulthread-15a72.firebaseapp.com",
    projectId: "soulthread-15a72",
    storageBucket: "soulthread-15a72.firebasestorage.app",
    messagingSenderId: "813685915255",
    appId: "1:813685915255:web:553165fc25cc38f5121072",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.jpg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
