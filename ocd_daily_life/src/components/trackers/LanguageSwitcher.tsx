import React from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'zh', name: 'Mandarin', native: '简体中文' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'pl', name: 'Polish', native: 'Polski' },
    { code: 'th', name: 'Thai', native: 'ไทย' },
    { code: 'tl', name: 'Tagalog', native: 'Filipino' },
];

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        // Update URL without refreshing
        const url = new URL(window.location.href);
        url.searchParams.set('lang', code);
        window.history.pushState({}, '', url);
    };

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/50 rounded-full text-xs font-bold hover:bg-white transition-all shadow-soft active:scale-95 group">
                    <Globe className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
                    <span className="hidden sm:inline">{currentLang.native}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto rounded-2xl p-2 shadow-soft-lg animate-scale-in custom-scrollbar">
                {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${i18n.language === lang.code ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"
                            }`}
                    >
                        <div className="flex flex-col">
                            <span className="font-semibold">{lang.native}</span>
                            <span className="text-[10px] opacity-60">{lang.name}</span>
                        </div>
                        {i18n.language === lang.code && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
