import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const enTranslation = {
    "header": {
        "title": "OCD Log",
        "subtitle": "Track & Insights",
        "history": "History",
        "insights": "See Weekly Insights"
    },
    "form": {
        "location_label": "Where are you?",
        "custom_location_placeholder": "Enter custom location...",
        "urge_label": "What urge or thought?",
        "urge_placeholder": "Describe what's on your mind...",
        "recent_for": "Recent for {{location}}",
        "response_label": "How did you respond?",
        "submit": "Save Entry",
        "submitting": "Logging Moment...",
        "success": "Entry Saved!",
        "success_subtitle": "Your moment has been logged successfully."
    },
    "responses": {
        "acted": "Acting on the urge",
        "waited": "Waiting",
        "noticed": "Noticed without acting",
        "desc_acted": "I noticed myself acting on the urge",
        "desc_waited": "I noticed myself waiting",
        "desc_noticed": "I noticed the urge without acting"
    },
    "locations": {
        "home": "Home",
        "work": "Work",
        "school": "School",
        "public": "Public",
        "other": "Other"
    },
    "date": {
        "today": "Today",
        "yesterday": "Yesterday"
    },
    "history": {
        "title": "History",
        "empty": "No history entries yet.",
        "load_all": "View all history",
        "back": "Back"
    },
    "history_view": {
        "title": "All Entries",
        "logged": "logged",
        "entry": "entry",
        "entries": "entries",
        "loading": "Loading entries...",
        "empty": "No entries logged at {{location}} yet."
    },
    "insights": {
        "title": "Response Insights",
        "subtitle": "Reflections on your logged responses",
        "loading": "Loading insights...",
        "no_data": "No Data for this Period",
        "no_data_desc": "Entries from the \"OCD Moment\" tracker will appear here to provide insights.",
        "disclaimer": "⚠️ Disclaimer: Insights require at least 1 entry to show summary, and 4 entries for pattern analysis.",
        "need_more": "Note: Add {{count}} more entries for full pattern analysis.",
        "patterns_title": "Response Patterns Observed",
        "promo_title": "Want personalized support?",
        "promo_desc": "Work with a therapist to develop strategies for managing urges.",
        "promo_button": "Book an appointment with the ERP therapist",
        "view_past": "View past logged entries ({{count}})",
        "past_entries": "Past Entries",
        "hide": "Hide"
    },
    "footer": {
        "tip": "Consistently logging helps identify your progress patterns."
    }
};

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'],

        resources: {
            en: {
                translation: enTranslation
            }
        },

        ns: ['translation'],
        defaultNS: 'translation',

        detection: {
            order: ['querystring', 'localStorage', 'cookie', 'navigator', 'htmlTag'],
            lookupQuerystring: 'lang',
            caches: ['localStorage', 'cookie'],
        },

        interpolation: {
            escapeValue: false,
        },

        backend: {
            loadPath: 'locales/{{lng}}/translation.json',
        },

        react: {
            useSuspense: false,
        },

        load: 'languageOnly',
        cleanCode: true
    });

// Handle RTL for Arabic
i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
});

export default i18n;
