import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const enTranslation = {
    "header": {
        "title": "Daily Life",
        "subtitle": "Track & Insights",
        "history": "History",
        "insights": "See Weekly Insights"
    },
    "form": {
        "title": "Daily Impact Check-in",
        "description": "Monitor how OCD affects your daily life across different areas.",
        "submit": "Save Daily Entry",
        "submitting": "Saving Check-in...",
        "success": "Check-in Saved!",
        "success_subtitle": "Your daily impact has been recorded."
    },
    "domains": {
        "workStudy": "Work & Study",
        "relationships": "Relationships & Social",
        "sleepRoutine": "Sleep & Routine",
        "selfCare": "Self-Care",
        "none": "None",
        "high": "High"
    },
    "insights": {
        "title": "Weekly Insights",
        "analysis": "Weekly Impact Analysis",
        "metrics": "Health Metrics",
        "loading": "Loading insights...",
        "empty": "No check-ins for this period yet.",
        "progress": "You're making progress!",
        "tip": "Consistently tracking your daily interference helps you and your therapist understand the bigger picture."
    },
    "date": {
        "today": "Today",
        "yesterday": "Yesterday"
    },
    "footer": {
        "tip": "Daily check-ins help you stay mindful of your recovery journey."
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
