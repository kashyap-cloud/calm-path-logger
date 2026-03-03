import React, { useState, useEffect } from "react";
import { Check, Loader2, Brain, History, TrendingUp, Clock, ChevronDown, Zap, Shield, Info, BarChart3, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import BackButton from "../trackers/BackButton";
import ScreenTransition from "../trackers/ScreenTransition";
import GradientCard from "../trackers/GradientCard";
import { Slider } from "@/components/ui/slider";
import { useInterferenceLocal, CheckinEntry } from "@/hooks/useInterferenceLocal";

type ViewState = "log" | "insights" | "history" | "confirmation";
type Step = "workStudy" | "relationships" | "sleepRoutine" | "selfCare";

interface InterferenceTrackerProps {
  onClose: () => void;
}

const DOMAINS = [
  { key: "workStudy", label: "Work & Study", emoji: "💼", step: "workStudy" as Step, dbKey: "workStudy" },
  { key: "relationships", label: "Relationships & Social", emoji: "👥", step: "relationships" as Step, dbKey: "relationships" },
  { key: "sleepRoutine", label: "Sleep & Routine", emoji: "😴", step: "sleepRoutine" as Step, dbKey: "sleepRoutine" },
  { key: "selfCare", label: "Self-Care", emoji: "❤️", step: "selfCare" as Step, dbKey: "selfCare" },
];

const InterferenceTracker: React.FC<InterferenceTrackerProps> = ({ onClose }) => {
  const [viewState, setViewState] = useState<ViewState>("log");
  const [values, setValues] = useState<Record<string, number | null>>({
    workStudy: 5,
    relationships: 5,
    sleepRoutine: 5,
    selfCare: 5,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const {
    submitCheckin,
    isSubmitting,
    weeklyAverages,
    weeklySummary,
    isLoadingWeekly,
    refetchWeekly,
    weekWindows,
    selectedWeek,
    setSelectedWeek,
    entries,
  } = useInterferenceLocal();

  // Reset form after confirmation
  useEffect(() => {
    if (viewState === "confirmation") {
      const timer = setTimeout(() => {
        setViewState("log");
        setValues({
          workStudy: 5,
          relationships: 5,
          sleepRoutine: 5,
          selfCare: 5,
        });
        setTouched({});
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  const handleWeekChange = (key: any) => {
    setSelectedWeek(key);
  };

  const handleSliderChange = (key: string, value: number[]) => {
    setValues((prev) => ({ ...prev, [key]: value[0] }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleSubmit = async () => {
    const success = await submitCheckin({
      workStudy: touched.workStudy ? values.workStudy : values.workStudy,
      relationships: touched.relationships ? values.relationships : values.relationships,
      sleepRoutine: touched.sleepRoutine ? values.sleepRoutine : values.sleepRoutine,
      selfCare: touched.selfCare ? values.selfCare : values.selfCare,
    });
    if (success) {
      setViewState("confirmation");
      refetchWeekly();
    }
  };

  const getSliderColor = (value: number | null) => {
    if (value === null) return "text-muted-foreground";
    if (value <= 3) return "text-emerald-500";
    if (value <= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getBarWidth = (avg: number | null) => {
    if (avg === null) return 0;
    return (avg / 10) * 100;
  };

  if (viewState === "insights") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-background to-background pb-20">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-teal-100 px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => setViewState("log")}
            className="w-10 h-10 rounded-full bg-white border border-teal-100 flex items-center justify-center text-teal-600 shadow-soft active:scale-90 transition-all"
          >
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Weekly Insights</h1>
        </header>

        <main className="px-5 py-8 max-w-2xl mx-auto">
          <ScreenTransition>
            <div className="space-y-6">
              {/* Week Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {weekWindows.map((week) => (
                  <button
                    key={week.key}
                    onClick={() => handleWeekChange(week.key as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${selectedWeek === week.key
                      ? "gradient-teal text-white shadow-glow"
                      : "bg-white text-foreground border border-teal-50 shadow-soft"
                      }`}
                  >
                    {week.label}
                  </button>
                ))}
              </div>

              {isLoadingWeekly ? (
                <div className="flex flex-col items-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">Loading insights...</p>
                </div>
              ) : weeklyAverages ? (
                <div className="space-y-6">
                  <GradientCard className="bg-white border border-teal-50 shadow-soft-lg overflow-hidden">
                    <div className="p-6 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl gradient-teal flex items-center justify-center shadow-soft">
                          <BarChart3 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Weekly Impact Analysis</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Health Metrics</p>
                        </div>
                      </div>

                      <div className="space-y-5 pt-2">
                        {DOMAINS.map((domain) => {
                          const avgValue = weeklyAverages[domain.dbKey as keyof typeof weeklyAverages];
                          return (
                            <div key={domain.key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{domain.emoji}</span>
                                  <span className="text-xs font-bold text-foreground">{domain.label}</span>
                                </div>
                                <span className={`text-xs font-black ${getSliderColor(avgValue)}`}>
                                  {avgValue !== null ? avgValue.toFixed(1) : "—"}
                                </span>
                              </div>
                              <div className="h-2.5 bg-teal-50/50 rounded-full overflow-hidden border border-teal-50/30">
                                <div
                                  className="h-full gradient-teal rounded-full transition-all duration-700 ease-out shadow-inner"
                                  style={{ width: `${getBarWidth(avgValue)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {weeklySummary && (
                        <div className="bg-teal-50/30 border border-teal-100/50 rounded-2xl p-4">
                          <p className="text-xs text-teal-800 leading-relaxed font-medium italic">"{weeklySummary}"</p>
                        </div>
                      )}
                    </div>
                  </GradientCard>

                  <div className="bg-white rounded-3xl p-6 border border-teal-50 shadow-soft text-center py-8 space-y-3">
                    <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-6 h-6 text-teal-400" />
                    </div>
                    <p className="text-sm font-bold text-foreground">You're making progress!</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">Consistently tracking your daily interference helps you and your therapist understand the bigger picture.</p>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="w-10 h-10 text-teal-200" />
                  </div>
                  <p className="text-muted-foreground font-medium">No check-ins for this period yet.</p>
                </div>
              )}
            </div>
          </ScreenTransition>
        </main>
      </div>
    );
  }

  if (viewState === "history") {
    const historyEntries = Array.isArray(entries) ? entries : [];

    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-background to-background pb-20">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-teal-100 px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => setViewState("log")}
            className="w-10 h-10 rounded-full bg-white border border-teal-100 flex items-center justify-center text-teal-600 shadow-soft active:scale-90 transition-all"
          >
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>
          <h1 className="text-lg font-bold text-foreground">History</h1>
        </header>

        <main className="px-5 py-6 max-w-2xl mx-auto space-y-4">
          <ScreenTransition>
            {historyEntries.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto">
                  <History className="w-10 h-10 text-teal-200" />
                </div>
                <p className="text-muted-foreground font-medium">No history entries yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...historyEntries].reverse().map((entry, idx) => (
                  <div key={idx} className="p-5 bg-white rounded-3xl border border-teal-50 shadow-soft space-y-4 animate-in fade-in slide-in-from-bottom-2 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">{format(new Date(entry.createdAt), "MMMM d, h:mm a")}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {DOMAINS.map(domain => {
                        const val = entry[domain.dbKey as keyof CheckinEntry];
                        return typeof val === 'number' ? (
                          <div key={domain.key} className="flex items-center gap-3 bg-teal-50/40 p-3 rounded-2xl border border-teal-100/50 shadow-soft-xs">
                            <span className="text-xl">{domain.emoji}</span>
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-1">{domain.label}</p>
                              <p className={`text-sm font-black leading-none ${getSliderColor(val)}`}>{val}</p>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
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
            <div className="w-24 h-24 rounded-full gradient-teal flex items-center justify-center mb-6 mx-auto animate-bounce-in shadow-glow-lg text-white">
              <Check className="w-12 h-12" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Check-in Saved!</h2>
            <p className="text-muted-foreground">Your daily impact has been recorded.</p>
          </div>
        </ScreenTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-background to-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-teal-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center shadow-soft">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">Daily Life</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">Track & Insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <button
              onClick={() => setViewState("history")}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border bg-white text-teal-600 border-teal-100 hover:bg-teal-50 shadow-sm"
            >
              <History className="w-4 h-4" />
              History
            </button>
          )}
          <button
            onClick={() => {
              refetchWeekly();
              setViewState("insights");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm active:scale-95 border border-blue-100"
          >
            <TrendingUp className="w-4 h-4" />
            See Weekly Insights
          </button>
        </div>
      </header>

      <main className="px-5 py-8 max-w-2xl mx-auto">
        <ScreenTransition>
          <div className="space-y-8">
            <div className="space-y-4 px-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Daily Impact Check-in</h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md font-medium">
                Monitor how OCD affects your daily life across different areas.
              </p>
            </div>

            <div className="grid gap-6">
              {DOMAINS.map((domain) => (
                <div key={domain.key} className="bg-white p-6 rounded-3xl border border-teal-50 shadow-soft hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50/50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                        {domain.emoji}
                      </div>
                      <h3 className="font-bold text-foreground">{domain.label}</h3>
                    </div>
                    <div className={`px-3 py-1 bg-teal-50/30 rounded-full border border-teal-100/50 flex flex-col items-center justify-center min-w-[50px]`}>
                      <span className={`text-lg font-black leading-none ${getSliderColor(values[domain.key])}`}>
                        {values[domain.key] ?? "5"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">
                      <span>None</span>
                      <span>High</span>
                    </div>
                    <Slider
                      value={[values[domain.key] ?? 5]}
                      onValueChange={(v) => handleSliderChange(domain.key, v)}
                      max={10}
                      step={1}
                      className="py-2"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 pb-8">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-5 gradient-teal text-white font-black rounded-3xl shadow-glow transition-all duration-300 hover:shadow-glow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="relative z-10">Saving Check-in...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6 relative z-10" />
                    <span className="relative z-10 text-lg">Save Daily Entry</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </ScreenTransition>
      </main>

      <footer className="px-5 pb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-xs border border-teal-50">
          <Info className="w-3 h-3 text-teal-400" />
          <p className="text-[10px] text-muted-foreground font-medium">
            Daily check-ins help you stay mindful of your recovery journey.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default InterferenceTracker;
