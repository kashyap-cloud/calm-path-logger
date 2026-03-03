// Run: node generate-locales.js
// Regenerates all locale JSON files for BOTH trackers using Google Translate (unofficial free endpoint)

const fs = require('fs');
const path = require('path');
const https = require('https');

const LANGUAGES = ['es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'];

const OCD_LOGS_EN = {
    "header": { "title": "OCD Log", "subtitle": "Track & Insights", "history": "History", "insights": "See Weekly Insights" },
    "form": {
        "location_label": "Where are you?", "custom_location_placeholder": "Enter custom location...",
        "urge_label": "What urge or thought?", "urge_placeholder": "Describe what's on your mind...",
        "recent_for": "Recent for at home", "response_label": "How did you respond?",
        "submit": "Save Entry", "submitting": "Logging Moment...", "success": "Entry Saved!",
        "success_subtitle": "Your moment has been logged successfully."
    },
    "responses": {
        "acted": "Acting on the urge", "waited": "Waiting", "noticed": "Noticed without acting",
        "desc_acted": "I noticed myself acting on the urge", "desc_waited": "I noticed myself waiting",
        "desc_noticed": "I noticed the urge without acting"
    },
    "locations": { "home": "Home", "work": "Work", "school": "School", "public": "Public", "other": "Other" },
    "date": { "today": "Today", "yesterday": "Yesterday" },
    "history": { "title": "History", "empty": "No history entries yet.", "load_all": "View all history", "back": "Back" },
    "history_view": { "title": "All Entries", "logged": "logged", "entry": "entry", "entries": "entries", "loading": "Loading entries...", "empty": "No entries logged at this location yet." },
    "insights": {
        "title": "Response Insights", "subtitle": "Reflections on your logged responses", "loading": "Loading insights...",
        "no_data": "No Data for this Period", "no_data_desc": "Entries from the OCD Moment tracker will appear here to provide insights.",
        "disclaimer": "Disclaimer: Insights require at least 1 entry to show summary, and 4 entries for pattern analysis.",
        "need_more": "Note: Add more entries for full pattern analysis.", "patterns_title": "Response Patterns Observed",
        "promo_title": "Want personalized support?", "promo_desc": "Work with a therapist to develop strategies for managing urges.",
        "promo_button": "Book an appointment with the ERP therapist", "view_past": "View past logged entries",
        "past_entries": "Past Entries", "hide": "Hide"
    },
    "footer": { "tip": "Consistently logging helps identify your progress patterns." }
};

const OCD_DAILY_EN = {
    "header": { "title": "Daily Life", "subtitle": "Track & Insights", "history": "History", "insights": "See Weekly Insights" },
    "form": {
        "title": "Daily Impact Check-in", "description": "Monitor how OCD affects your daily life across different areas.",
        "submit": "Save Daily Entry", "submitting": "Saving Check-in...", "success": "Check-in Saved!",
        "success_subtitle": "Your daily impact has been recorded."
    },
    "domains": { "workStudy": "Work & Study", "relationships": "Relationships & Social", "sleepRoutine": "Sleep & Routine", "selfCare": "Self-Care", "none": "None", "high": "High" },
    "insights": {
        "title": "Weekly Insights", "analysis": "Weekly Impact Analysis", "metrics": "Health Metrics",
        "loading": "Loading insights...", "empty": "No check-ins for this period yet.",
        "progress": "You're making progress!", "tip": "Consistently tracking your daily interference helps you and your therapist understand the bigger picture."
    },
    "date": { "today": "Today", "yesterday": "Yesterday" },
    "footer": { "tip": "Daily check-ins help you stay mindful of your recovery journey." }
};

function translateText(text, targetLang) {
    return new Promise((resolve) => {
        const encoded = encodeURIComponent(text);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encoded}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const translated = parsed[0].map(item => item[0]).join('');
                    resolve(translated);
                } catch {
                    resolve(text); // fallback to original
                }
            });
        }).on('error', () => resolve(text));
    });
}

async function translateObject(obj, targetLang) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            // Preserve template placeholders like {{location}}
            const placeholders = [];
            let protected_val = value.replace(/\{\{[^}]+\}\}/g, (m) => { placeholders.push(m); return `__P${placeholders.length - 1}__`; });
            let translated = await translateText(protected_val, targetLang);
            placeholders.forEach((p, i) => { translated = translated.replace(`__P${i}__`, p); });
            result[key] = translated;
            await new Promise(r => setTimeout(r, 80)); // rate limit
        } else if (typeof value === 'object') {
            result[key] = await translateObject(value, targetLang);
        }
    }
    return result;
}

async function generateLocales(enData, outDir, trackerName) {
    console.log(`\n=== Generating locales for ${trackerName} ===`);
    // Write English first
    fs.mkdirSync(path.join(outDir, 'en'), { recursive: true });
    fs.writeFileSync(path.join(outDir, 'en', 'translation.json'), JSON.stringify(enData, null, 2));
    console.log(`  [en] Written`);

    for (const lang of LANGUAGES) {
        console.log(`  [${lang}] Translating...`);
        try {
            const translated = await translateObject(enData, lang);
            const dir = path.join(outDir, lang);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, 'translation.json'), JSON.stringify(translated, null, 2));
            console.log(`  [${lang}] Done`);
        } catch (e) {
            console.error(`  [${lang}] Failed: ${e.message}`);
        }
    }
}

(async () => {
    const base = path.join(__dirname);
    await generateLocales(OCD_LOGS_EN, path.join(base, 'ocd_logs', 'public', 'locales'), 'ocd_logs');
    await generateLocales(OCD_DAILY_EN, path.join(base, 'ocd_daily_life', 'public', 'locales'), 'ocd_daily_life');
    console.log('\n✅ All locale files generated!');
})();
