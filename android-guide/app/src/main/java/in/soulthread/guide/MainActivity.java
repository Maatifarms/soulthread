package in.soulthread.guide;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onStart() {
        super.onStart();
        configureWebView();
    }

    private void configureWebView() {
        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        // Disabling Android's overscroll glow effect fixes the "can't scroll up" bug.
        // When overscroll triggers, Android reports scrollY=0 even if content is scrolled,
        // which confuses the browser's scroll state and blocks upward fling gestures.
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        // Hide native scrollbars — the app has its own CSS-driven scroll UI
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
    }

    /**
     * BUG 3 FIX — Android back button closes app instead of navigating back.
     *
     * Capacitor 7/8's BridgeActivity registers its own OnBackPressedCallback
     * internally (for predictive-back gesture support on Android 13+), which
     * means overriding the old Activity.onBackPressed() method never actually
     * gets called anymore. Registering our own callback through the same
     * OnBackPressedDispatcher — added after super.onCreate() so it takes
     * priority over Capacitor's internal one — is the mechanism that's
     * actually guaranteed to run.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Programmatically initialize Firebase using reflection if google-services.json was not applied at build time
        try {
            Class<?> firebaseAppClass = Class.forName("com.google.firebase.FirebaseApp");
            java.util.List<?> apps = (java.util.List<?>) firebaseAppClass.getMethod("getApps", android.content.Context.class).invoke(null, this);
            if (apps != null && apps.isEmpty()) {
                Class<?> builderClass = Class.forName("com.google.firebase.FirebaseOptions$Builder");
                Object builder = builderClass.getConstructor().newInstance();

                builderClass.getMethod("setApiKey", String.class).invoke(builder, "AIzaSyBcpOg9-ZKbEDkPGI3hHlrvekwh4PPHrCY");
                builderClass.getMethod("setProjectId", String.class).invoke(builder, "soulthread-15a72");
                builderClass.getMethod("setGcmSenderId", String.class).invoke(builder, "813685915255");
                builderClass.getMethod("setStorageBucket", String.class).invoke(builder, "soulthread-15a72.firebasestorage.app");
                builderClass.getMethod("setApplicationId", String.class).invoke(builder, "1:813685915255:web:553165fc25cc38f5121072");

                Object options = builderClass.getMethod("build").invoke(builder);
                Class<?> optionsClass = Class.forName("com.google.firebase.FirebaseOptions");
                firebaseAppClass.getMethod("initializeApp", android.content.Context.class, optionsClass).invoke(null, this, options);
            }
        } catch (Exception e) {
            android.util.Log.w("MainActivity", "Firebase fallback initialization skipped or failed: " + e.getMessage());
        }

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    // At root — minimise instead of destroying the activity
                    moveTaskToBack(true);
                }
            }
        });
    }
}
