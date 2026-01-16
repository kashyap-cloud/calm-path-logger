import React, { useState } from "react";
import { Check } from "lucide-react";
import BackButton from "../trackers/BackButton";
import ScreenTransition from "../trackers/ScreenTransition";
import GradientCard from "../trackers/GradientCard";
import { Slider } from "@/components/ui/slider";
import useTrackerData from "@/hooks/useTrackerData";

type Step = "welcome" | "workStudy" | "relationships" | "sleepRoutine" | "selfCare" | "confirmation" | "weekly";

interface InterferenceTrackerProps {
  onClose: () => void;
}

const DOMAINS = [
  { key: "workStudy", label: "Work & Study", emoji: "💼", step: "workStudy" as Step },
  { key: "relationships", label: "Relationships & Social", emoji: "👥", step: "relationships" as Step },
  { key: "sleepRoutine", label: "Sleep & Routine", emoji: "😴", step: "sleepRoutine" as Step },
  { key: "selfCare", label: "Self-Care", emoji: "❤️", step: "selfCare" as Step },
];

const InterferenceTracker: React.FC<InterferenceTrackerProps> = ({ onClose }) => {
  const [step, setStep] = useState<Step>("welcome");
  const [values, setValues] = useState({ workStudy: 5, relationships: 5, sleepRoutine: 5, selfCare: 5 });
  
  const { addInterferenceEntry, getInterferenceByWeek, currentWeek } = useTrackerData();

  const handleSliderChange = (key: string, value: number[]) => {
    setValues(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleNext = () => {
    const steps: Step[] = ["workStudy", "relationships", "sleepRoutine", "selfCare", "confirmation"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
    if (step === "selfCare") {
      addInterferenceEntry(values.workStudy, values.relationships, values.sleepRoutine, values.selfCare);
    }
  };

  const currentDomain = DOMAINS.find(d => d.step === step);
  const currentInterference = getInterferenceByWeek(currentWeek);
  const lastWeekInterference = getInterferenceByWeek(currentWeek - 1);

  const getSliderColor = (value: number) => {
    if (value <= 3) return "bg-slider-low";
    if (value <= 6) return "bg-slider-mid";
    return "bg-slider-high";
  };

  const getTrendBar = (current: number, previous: number | null) => {
    const width = (current / 10) * 100;
    return (
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full gradient-teal rounded-full transition-all duration-500"
          style={{ width: `${width}%` }}
        />
      </div>
    );
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

              <button onClick={() => setStep("workStudy")} className="w-full py-4 gradient-teal text-white font-medium rounded-2xl shadow-glow transition-all active:scale-[0.98]">
                Start Check-in
              </button>

              <button onClick={() => setStep("weekly")} className="w-full py-3 bg-white text-secondary font-medium rounded-2xl shadow-soft">
                View Weekly Report 📈
              </button>
            </div>
          </ScreenTransition>
        )}

        {currentDomain && (
          <ScreenTransition key={step}>
            <div className="space-y-8">
              <div className="text-center">
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
                  value={[values[currentDomain.key as keyof typeof values]]}
                  onValueChange={(v) => handleSliderChange(currentDomain.key, v)}
                  max={10}
                  step={1}
                  className="py-4"
                />

                <div className={`text-center text-3xl font-bold ${getSliderColor(values[currentDomain.key as keyof typeof values])} bg-clip-text text-transparent`}>
                  {values[currentDomain.key as keyof typeof values]}
                </div>
              </div>

              <button onClick={handleNext} className="w-full py-4 gradient-teal text-white font-medium rounded-2xl shadow-glow">
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
              <h2 className="text-2xl font-bold mb-2">Thanks for your input! 🙏</h2>
              <p className="text-muted-foreground text-center">Your daily check-in is saved</p>
              <button onClick={onClose} className="mt-6 px-6 py-3 bg-white shadow-soft rounded-xl font-medium">Done</button>
            </div>
          </ScreenTransition>
        )}

        {step === "weekly" && (
          <ScreenTransition>
            <div className="space-y-5">
              {currentInterference ? (
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
                      {DOMAINS.map((domain) => (
                        <div key={domain.key} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span>{domain.emoji}</span>
                            <span className="text-sm font-medium">{domain.label}</span>
                          </div>
                          {getTrendBar(currentInterference[domain.key as keyof typeof currentInterference] as number, null)}
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/60 rounded-xl p-3 mt-4">
                      <p className="text-sm text-foreground">OCD had varied impact across life areas this week.</p>
                    </div>

                    <p className="text-sm text-secondary font-medium text-center">Keep tracking - you're doing great! 🌟</p>
                  </div>
                </GradientCard>
              ) : (
                <GradientCard className="bg-white shadow-soft">
                  <div className="py-8 text-center">
                    <span className="text-4xl mb-4 block">⏳</span>
                    <p className="font-medium">Results still ongoing</p>
                    <p className="text-sm text-muted-foreground mt-1">Complete more check-ins this week</p>
                    {lastWeekInterference && (
                      <button className="mt-4 text-secondary text-sm font-medium">View last week's results →</button>
                    )}
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
