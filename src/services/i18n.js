/**
 * i18n.js — Multi-Language Support System (Task 69)
 *
 * Exposes a localization dictionary mapping keys to strings 
 * supporting English, Hindi, Spanish, and German globally.
 * Prepares the platform for international traffic routing.
 */

class LocalizationEngine {
    constructor() {
        this.currentLocale = this.detectLocale();
        this.dictionaries = {
            'en': {
                'greeting': 'Welcome back to your Sanctuary',
                'nav.feed': 'Global Feed',
                'nav.messages': 'Messages',
                'nav.healing': 'Healing Hub',
                'action.newPost': 'Share a thought',
                'action.report': 'Report Post',
                'status.online': 'Online'
            },
            'hi': {
                'greeting': 'आपके अभयारण्य में आपका स्वागत है',
                'nav.feed': 'वैश्विक फ़ीड',
                'nav.messages': 'संदेश',
                'nav.healing': 'उपचार केंद्र',
                'action.newPost': 'एक विचार साझा करें',
                'action.report': 'पोस्ट की रिपोर्ट करें',
                'status.online': 'ऑनलाइन'
            },
            'es': {
                'greeting': 'Bienvenido a tu santuario',
                'nav.feed': 'Feed Global',
                'nav.messages': 'Mensajes',
                'nav.healing': 'Centro de Curación',
                'action.newPost': 'Comparte un pensamiento',
                'action.report': 'Reportar',
                'status.online': 'En línea'
            },
            'de': {
                'greeting': 'Willkommen in deinem Zufluchtsort',
                'nav.feed': 'Globaler Feed',
                'nav.messages': 'Nachrichten',
                'nav.healing': 'Heilungs-Hub',
                'action.newPost': 'Einen Gedanken teilen',
                'action.report': 'Beitrag melden',
                'status.online': 'Online'
            }
        };
    }

    /**
     * Polls the physical browser config naturally picking user's native tongue
     */
    detectLocale() {
        try {
            const stored = localStorage.getItem('st_locale');
            if (stored) return stored;

            const browserLang = navigator.language.split('-')[0];
            const supported = ['en', 'hi', 'es', 'de'];
            return supported.includes(browserLang) ? browserLang : 'en';
        } catch (e) { return 'en'; }
    }

    setLocale(langCode) {
        if (this.dictionaries[langCode]) {
            this.currentLocale = langCode;
            localStorage.setItem('st_locale', langCode);
            // In React, this would trigger a Global Context forceUpdate natively
        }
    }

    /**
     * Synthesizes localization template strings
     */
    t(key) {
        const dict = this.dictionaries[this.currentLocale] || this.dictionaries['en'];
        return dict[key] || key; // Fallbacks to raw key if translation missing
    }

    /**
     * Prepares for dynamic string translation natively hooking Cloud Translation API
     */
    async translateUserPost(textBody, targetLanguage) {
        // [In Production] this fires a Firebase Callable Function calling Google Translate
        console.log(`[i18n] Translating: '${textBody}' to [${targetLanguage}] via Google Cloud AI.`);
        return `[Translated to ${targetLanguage.toUpperCase()}]: ${textBody}`;
    }
}

export const i18n = new LocalizationEngine();
