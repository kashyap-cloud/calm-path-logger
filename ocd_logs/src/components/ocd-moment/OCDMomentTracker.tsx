import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, Loader2, Brain, MapPin, Zap, Info, CheckCircle2, TrendingUp, History, ChevronDown, ChevronUp, Clock, Shield } from "lucide-react";
import { format } from "date-fns";
import ScreenTransition from "../trackers/ScreenTransition";
import {
  Location,
  LOCATION_CONFIG,
  RESPONSE_CONFIG,
  ResponseType as TrackerResponseType
} from "@/hooks/useTrackerData";
import useOCDMomentDB from "@/hooks/useOCDMomentDB";
import ResponseInsightsTracker from "../response-insights/ResponseInsightsTracker";
import { LanguageSwitcher } from "../trackers/LanguageSwitcher";

type ViewState = "log" | "insights" | "history" | "confirmation";

interface OCDMomentTrackerProps {
  onClose: () => void;
}

const OCDMomentTracker: React.FC<OCDMomentTrackerProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [viewState, setViewState] = useState<ViewState>("log");
  const [location, setLocation] = useState<Location>("home");
  const [urge, setUrge] = useState("");
  const [responseType, setResponseType] = useState<TrackerResponseType>("acted");
  const [customLocationName, setCustomLocationName] = useState("");
  // State for form

  // Auto-close confirmation after 2.5 seconds and reset form
  useEffect(() => {
    if (viewState === "confirmation") {
      const timer = setTimeout(() => {
        setViewState("log");
        setUrge(""); // Clear urge
        setResponseType("acted"); // Reset to default response type
        setLocation("home"); // Reset to default location (optional, but makes it "default state")
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  const {
    isSubmitting,
    allEntries,
    previousEntries,
    fetchRecentEntries,
    submitOCDMoment,
  } = useOCDMomentDB();

  useEffect(() => {
    if (location) {
      const locationLabel = LOCATION_CONFIG[location].label;
      fetchRecentEntries(locationLabel);
    }
  }, [location, fetchRecentEntries, allEntries]);

  const handleSubmit = async () => {
    if (!urge.trim()) return;

    const locationString = LOCATION_CONFIG[location].label;
    const customLocationValue = location === "other" && customLocationName.trim()
      ? customLocationName.trim()
      : null;

    let mappedResponse: "acted" | "waited" | "noticed_without_acting" = "acted";
    if (responseType === "delayed") mappedResponse = "waited";
    if (responseType === "resisted") mappedResponse = "noticed_without_acting";

    const success = await submitOCDMoment(locationString, urge.trim(), mappedResponse, customLocationValue);
    if (success) {
      setViewState("confirmation");
    }
  };

  if (viewState === "insights") {
    return <ResponseInsightsTracker onClose={() => setViewState("log")} />;
  }

  if (viewState === "history") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-background to-background">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-100 px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => setViewState("log")}
            className="w-10 h-10 rounded-full bg-white border border-purple-100 flex items-center justify-center text-purple-600 shadow-soft active:scale-90 transition-all"
          >
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t('history.title')}</h1>
        </header>

        <main className="px-5 py-6 max-w-2xl mx-auto space-y-4">
          <ScreenTransition>
            {allEntries.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto">
                  <History className="w-10 h-10 text-purple-200" />
                </div>
                <p className="text-muted-foreground font-medium">{t('history.empty')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allEntries.map((entry, idx) => {
                  const locConfig = Object.values(LOCATION_CONFIG).find(l => l.label === entry.location) || LOCATION_CONFIG.home;
                  const resConfig = Object.values(RESPONSE_CONFIG).find((r, rIdx) => {
                    const keys = Object.keys(RESPONSE_CONFIG);
                    const mapped = keys[rIdx] === "acted" ? "acted" :
                      keys[rIdx] === "delayed" ? "waited" :
                        "noticed_without_acting";
                    return mapped === entry.response_type;
                  }) || RESPONSE_CONFIG.acted;

                  return (
                    <div key={idx} className="p-4 bg-white rounded-3xl border border-purple-50 shadow-soft space-y-3 animate-in fade-in slide-in-from-bottom-2 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0 text-2xl shadow-inner">
                            {locConfig.emoji}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">{entry.location}</p>
                            <p className="text-sm text-foreground font-semibold leading-relaxed">{entry.urge}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full ${resConfig.color} bg-opacity-20 flex items-center gap-1.5 flex-shrink-0 self-start border border-current border-opacity-10`}>
                          <span className="text-xs">{resConfig.emoji}</span>
                          <span className={`text-[10px] font-bold ${entry.response_type === "waited" ? "text-yellow-700" :
                            entry.response_type === "acted" ? "text-red-700" :
                              "text-emerald-700"
                            }`}>
                            {entry.response_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold border-t border-purple-50/50 pt-3 px-1">
                        <Clock className="w-3 h-3 text-purple-300" />
                        {format(new Date(entry.created_at), "MMMM d, h:mm a")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScreenTransition>
        </main>
      </div>
    );
  }

  if (viewState === "confirmation") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <ScreenTransition>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full gradient-purple flex items-center justify-center mb-6 mx-auto animate-bounce-in shadow-glow-lg">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('form.success')}</h2>
            <p className="text-muted-foreground">{t('form.success_subtitle')}</p>
          </div>
        </ScreenTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-background to-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center shadow-soft">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">{t('header.title')}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">{t('header.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {allEntries.length > 0 && (
            <button
              onClick={() => setViewState("history")}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border bg-white text-purple-600 border-purple-100 hover:bg-purple-50"
            >
              <History className="w-4 h-4" />
              {t('header.history')}
            </button>
          )}
          <button
            onClick={() => setViewState("insights")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm active:scale-95 border border-blue-100"
          >
            <TrendingUp className="w-4 h-4" />
            {t('header.insights')}
          </button>
        </div>
      </header>

      {/* Main Form */}
      <main className="px-5 py-8 max-w-2xl mx-auto space-y-10">
        <ScreenTransition>
          <div className="space-y-10">
            {/* Location Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('form.location_label')}</h2>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {(Object.keys(LOCATION_CONFIG) as Location[]).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${location === loc
                      ? "border-purple-600 bg-purple-50 shadow-sm scale-[1.02]"
                      : "border-transparent bg-white shadow-soft hover:bg-purple-50/50"
                      }`}
                  >
                    <span className="text-2xl">{LOCATION_CONFIG[loc].emoji}</span>
                    <span className="text-[10px] font-bold text-foreground whitespace-nowrap overflow-hidden">
                      {LOCATION_CONFIG[loc].label.split(" ")[1] || LOCATION_CONFIG[loc].label}
                    </span>
                  </button>
                ))}
              </div>
              {location === "other" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    value={customLocationName}
                    onChange={(e) => setCustomLocationName(e.target.value)}
                    placeholder={t('form.custom_location_placeholder')}
                    className="w-full px-4 py-3 bg-white border border-purple-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all shadow-soft"
                  />
                </div>
              )}
            </section>

            {/* Urge Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('form.urge_label')}</h2>
              </div>
              <textarea
                value={urge}
                onChange={(e) => setUrge(e.target.value)}
                placeholder={t('form.urge_placeholder')}
                rows={3}
                className="w-full px-4 py-4 bg-white border border-purple-100 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all shadow-soft resize-none"
              />

              {/* Previous Urges for this location */}
              {previousEntries.length > 0 && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center gap-2 px-1">
                    <History className="w-3.5 h-3.5 text-purple-400" />
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                      {t('form.recent_for', { location: LOCATION_CONFIG[location].label })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {Array.from(new Set(previousEntries.map(e => e.urge))).slice(0, 3).map((prevUrge, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUrge(prevUrge)}
                        className="px-5 py-2.5 bg-white hover:bg-purple-50 border border-purple-100 rounded-xl text-xs font-semibold text-foreground/90 transition-all duration-200 active:scale-95 shadow-soft hover:shadow-md hover:border-purple-200 text-left relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10">{prevUrge}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Response Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('form.response_label')}</h2>
              </div>
              <div className="grid gap-3">
                {(Object.keys(RESPONSE_CONFIG) as TrackerResponseType[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResponseType(res)}
                    className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all duration-300 text-left ${responseType === res
                      ? "border-purple-600 bg-purple-50 shadow-sm scale-[1.01]"
                      : "border-transparent bg-white shadow-soft hover:bg-purple-50/50"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center min-w-[40px] ${RESPONSE_CONFIG[res].color} shadow-sm text-white`}>
                      {res === "acted" && <Zap className="w-5 h-5" />}
                      {res === "delayed" && <Clock className="w-5 h-5" />}
                      {res === "resisted" && <Shield className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground leading-tight">{t(`responses.${res === 'delayed' ? 'waited' : res === 'resisted' ? 'noticed' : 'acted'}`)}</p>
                      <p className={`text-[10px] font-bold ${res === "delayed" ? "text-yellow-700" :
                        res === "acted" ? "text-red-700" :
                          "text-emerald-700"
                        }`}>
                        {t(`responses.desc_${res === 'delayed' ? 'waited' : res === 'resisted' ? 'noticed' : 'acted'}`)}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 border-purple-200 flex items-center justify-center transition-all ${responseType === res ? "border-purple-600 bg-purple-600 shadow-inner" : ""}`}>
                      {responseType === res && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !urge.trim()}
                className="w-full py-5 gradient-purple text-white font-black rounded-3xl shadow-glow transition-all duration-300 hover:shadow-glow-lg active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('form.submitting')}
                  </>
                ) : (
                  t('form.submit')
                )}
              </button>
            </div>
          </div>
        </ScreenTransition>
      </main>

      {/* Info Info */}
      <footer className="px-5 pb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-xs border border-purple-50">
          <Info className="w-3 h-3 text-purple-400" />
          <p className="text-[10px] text-muted-foreground font-medium">
            {t('footer.tip')}
          </p>
        </div>
      </footer>
    </div >
  );
};

export default OCDMomentTracker;
