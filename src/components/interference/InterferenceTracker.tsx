import React, { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import BackButton from "../trackers/BackButton";
import ScreenTransition from "../trackers/ScreenTransition";
import GradientCard from "../trackers/GradientCard";
import { Slider } from "@/components/ui/slider";
import { useInterferenceSupabase } from "@/hooks/useInterferenceSupabase";

type Step = "welcome" | "workStudy" | "relationships" | "sleepRoutine" | "selfCare" | "confirmation" | "weekly";

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
  const [step, setStep] = useState<Step>("welcome");
  const [values, setValues] = useState<Record<string, number | null>>({
    workStudy: null,
    relationships: null,
    sleepRoutine: null,
    selfCare: null,
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
  } = useInterferenceSupabase();

  const handleWeekChange = (key: any) => {
    setSelectedWeek(key);
  };

  const handleSliderChange = (key: string, value: number[]) => {
    setValues((prev) => ({ ...prev, [key]: value[0] }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleNext = async () => {
    const steps: Step[] = ["workStudy", "relationships", "sleepRoutine", "selfCare"];
    const currentIndex = steps.indexOf(step);

    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      return;
    }

    // On final step (selfCare) → submit
    if (step === "selfCare") {
      const success = await submitCheckin({
        workStudy: touched.workStudy ? values.workStudy : null,
        relationships: touched.relationships ? values.relationships : null,
        sleepRoutine: touched.sleepRoutine ? values.sleepRoutine : null,
        selfCare: touched.selfCare ? values.selfCare : null,
      });
      if (success) {
        setStep("confirmation");
        refetchWeekly();
      }
    }
  };

  const currentDomain = DOMAINS.find((d) => d.step === step);

  const getSliderColor = (value: number | null) => {
    if (value === null) return "text-muted-foreground";
    if (value <= 3) return "text-green-500";
    if (value <= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getBarWidth = (avg: number | null) => {
    if (avg === null) return 0;
    return (avg / 10) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-tracker-interference-light via-background to-background">
      <div className="gradient-teal pt-10 pb-6 px-5 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <BackButton onClick={onClose} />
          <h1 className="text-lg font-semibold text-white">Daily Interference</h1>
        </div>
        <p className="text-white/80 text-sm">
          {step === "welcome" && "How did OCD affect your day?"}
          {currentDomain && `Rate: ${currentDomain.label}`}
          {step === "confirmation" && "Thank you!"}
          {step === "weekly" && "Weekly Summary"}
        </p>
      </div>

      <div className="px-5 py-6">
        {step === "welcome" && (
          <ScreenTransition>
            <div className="space-y-6">
              <GradientCard className="bg-white shadow-soft">
                <div className="text-center py-4">
                  <span className="text-5xl block mb-4">📊</span>
                  <h2 className="text-xl font-semibold mb-2">Daily Check-in</h2>
                  <p className="text-sm text-muted-foreground">Rate how OCD interfered with different areas</p>
                </div>
              </GradientCard>

              <button
                onClick={() => setStep("workStudy")}
                className="w-full py-4 gradient-teal text-white font-medium rounded-2xl shadow-glow transition-all active:scale-[0.98]"
              >
                Start Check-in
              </button>

              <button
                onClick={() => {
                  refetchWeekly();
                  setStep("weekly");
                }}
                className="w-full py-3 bg-white text-secondary font-medium rounded-2xl shadow-soft"
              >
                View Weekly Report 📈
              </button>
            </div>
          </ScreenTransition>
        )}

        {currentDomain && (
          <ScreenTransition key={step}>
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{DOMAINS.findIndex((d) => d.step === step) + 1} of {DOMAINS.length}</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-teal rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((DOMAINS.findIndex((d) => d.step === step) + 1) / DOMAINS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-6xl block mb-4">{currentDomain.emoji}</span>
                <h2 className="text-xl font-semibold">{currentDomain.label}</h2>
                <p className="text-sm text-muted-foreground mt-2">How much did OCD interfere?</p>
              </div>

              <div className="space-y-6 py-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Not at all</span>
                  <span>Completely</span>
                </div>

                <Slider
                  value={[values[currentDomain.key] ?? 5]}
                  onValueChange={(v) => handleSliderChange(currentDomain.key, v)}
                  max={10}
                  step={1}
                  className="py-4"
                />

                <div className={`text-center text-3xl font-bold ${getSliderColor(touched[currentDomain.key] ? values[currentDomain.key] : null)}`}>
                  {touched[currentDomain.key] ? values[currentDomain.key] : "—"}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="w-full py-4 gradient-teal text-white font-medium rounded-2xl shadow-glow disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {step === "selfCare" ? "Submit" : "Next"}
              </button>
            </div>
          </ScreenTransition>
        )}

        {step === "confirmation" && (
          <ScreenTransition>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 rounded-full gradient-teal flex items-center justify-center mb-6 animate-bounce-in shadow-glow-lg">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Entry Saved! ✨</h2>
              <p className="text-muted-foreground text-center">Check weekly for insights 📊</p>
              <button onClick={onClose} className="mt-6 px-6 py-3 bg-white shadow-soft rounded-xl font-medium">
                Done
              </button>
            </div>
          </ScreenTransition>
        )}

        {step === "weekly" && (
          <ScreenTransition>
            <div className="space-y-5">
              {/* Week Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {weekWindows.map((week) => (
                  <button
                    key={week.key}
                    onClick={() => handleWeekChange(week.key as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedWeek === week.key
                      ? "gradient-teal text-white shadow-glow"
                      : "bg-white text-foreground shadow-soft"
                      }`}
                  >
                    {week.label}
                  </button>
                ))}
              </div>

              {isLoadingWeekly ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-secondary mb-3" />
                  <p className="text-sm text-muted-foreground">Loading weekly data…</p>
                </div>
              ) : weeklyAverages ? (
                <GradientCard className="bg-gradient-to-br from-white via-tracker-interference-light to-white shadow-soft-lg">
                  <div className="py-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full gradient-teal flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div>
                        <p className="font-semibold">This Week's Impact</p>
                        <p className="text-xs text-muted-foreground">Based on your daily check-ins</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      {DOMAINS.map((domain) => {
                        const avg = weeklyAverages[domain.dbKey as keyof typeof weeklyAverages];
                        return (
                          <div key={domain.key} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>{domain.emoji}</span>
                                <span className="text-sm font-medium">{domain.label}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {avg !== null ? avg.toFixed(1) : "—"}
                              </span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full gradient-teal rounded-full transition-all duration-500"
                                style={{ width: `${getBarWidth(avg)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {weeklySummary && (
                      <div className="bg-white/60 rounded-xl p-3 mt-4">
                        <p className="text-sm text-foreground">{weeklySummary}</p>
                      </div>
                    )}

                    <p className="text-sm text-secondary font-medium text-center">Keep tracking — you're doing great! 🌟</p>

                    {weeklyAverages.workStudy === null &&
                      weeklyAverages.relationships === null &&
                      weeklyAverages.sleepRoutine === null &&
                      weeklyAverages.selfCare === null && (
                        <p className="text-xs text-muted-foreground text-center italic">
                          Some categories have no data yet — insights will improve with more check-ins.
                        </p>
                      )}
                  </div>
                </GradientCard>
              ) : (
                <GradientCard className="bg-white shadow-soft">
                  <div className="py-8 text-center">
                    <span className="text-4xl mb-4 block">⏳</span>
                    <p className="font-medium">No check-ins yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start your daily check-in to see insights.
                    </p>
                  </div>
                </GradientCard>
              )}
            </div>
          </ScreenTransition>
        )}
      </div>
    </div>
  );
};

export default InterferenceTracker;
