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
