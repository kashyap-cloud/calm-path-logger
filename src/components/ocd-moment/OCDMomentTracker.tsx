import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import BackButton from "../trackers/BackButton";
import ScreenTransition from "../trackers/ScreenTransition";
import GradientCard from "../trackers/GradientCard";
import useTrackerData, { 
  Location, 
  ResponseType, 
  LOCATION_CONFIG, 
  RESPONSE_CONFIG,
  PREDEFINED_COMPULSIONS 
} from "@/hooks/useTrackerData";
import WeeklyInsightCard from "./WeeklyInsightCard";

type Step = "welcome" | "location" | "compulsion" | "response" | "confirmation" | "weekly";

interface OCDMomentTrackerProps {
  onClose: () => void;
}

const OCDMomentTracker: React.FC<OCDMomentTrackerProps> = ({ onClose }) => {
  const [step, setStep] = useState<Step>("welcome");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCompulsion, setSelectedCompulsion] = useState<string>("");
  const [customCompulsion, setCustomCompulsion] = useState("");
  const [customLocationName, setCustomLocationName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const { 
    addOCDEntry, 
    getCompulsionsByLocation,
    getWeeklyInsight,
    getAvailableWeeks,
    currentWeek 
  } = useTrackerData();

  // Auto-close confirmation after 2.5 seconds
  useEffect(() => {
    if (step === "confirmation") {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, onClose]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    // For "other" location, show custom input immediately
    if (location === "other") {
      setShowCustomInput(true);
    }
    setStep("compulsion");
  };

  const handleCompulsionSelect = (compulsion: string) => {
    setSelectedCompulsion(compulsion);
    setStep("response");
  };

  const handleCustomCompulsionAdd = () => {
    if (customCompulsion.trim()) {
      setSelectedCompulsion(customCompulsion.trim());
      setStep("response");
    }
  };

  const handleResponseSelect = (response: ResponseType) => {
    if (selectedLocation && selectedCompulsion) {
      addOCDEntry(selectedLocation, selectedCompulsion, response);
      setStep("confirmation");
    }
  };

  const goBack = () => {
    switch (step) {
      case "location":
        setStep("welcome");
        break;
      case "compulsion":
        setStep("location");
        setSelectedLocation(null);
        break;
      case "response":
        setStep("compulsion");
        setSelectedCompulsion("");
        break;
      case "weekly":
        setStep("welcome");
        break;
      default:
        onClose();
    }
  };

  const previousCompulsions = selectedLocation 
    ? getCompulsionsByLocation(selectedLocation) 
    : [];

  const predefinedOptions = selectedLocation 
    ? PREDEFINED_COMPULSIONS[selectedLocation].filter(c => !previousCompulsions.includes(c))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-tracker-moment-light via-background to-background">
      {/* Header */}
      <div className="gradient-purple pt-10 pb-6 px-5 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <BackButton onClick={step === "welcome" ? onClose : goBack} />
          <h1 className="text-lg font-semibold text-white">OCD Moment</h1>
        </div>
        <p className="text-white/80 text-sm">
          {step === "welcome" && "Track your moments, understand your patterns"}
          {step === "location" && "Where were you?"}
          {step === "compulsion" && "What urge or thought showed up?"}
          {step === "response" && "How did you respond?"}
          {step === "confirmation" && "Great job!"}
          {step === "weekly" && "Your Weekly Insights"}
        </p>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Welcome Step */}
        {step === "welcome" && (
          <ScreenTransition>
            <div className="space-y-6">
              <GradientCard className="bg-white shadow-soft">
                <div className="text-center py-4">
                  <div className="text-5xl mb-4">🧠</div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Log an OCD Moment
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Notice what showed up and how you responded.
                  </p>
                </div>
              </GradientCard>

              <button
                onClick={() => setStep("location")}
                className="w-full py-4 gradient-purple text-white font-medium rounded-2xl shadow-glow transition-all duration-300 hover:shadow-glow-lg active:scale-[0.98]"
              >
                Begin
              </button>

              <button
                onClick={() => setStep("weekly")}
                className="w-full py-3 bg-white text-primary font-medium rounded-2xl shadow-soft transition-all hover:shadow-md active:scale-[0.98]"
              >
                View Weekly Insights ✨
              </button>
            </div>
          </ScreenTransition>
        )}

        {/* Location Selection */}
        {step === "location" && (
          <ScreenTransition>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-6">
                Tap where you were when this happened
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(LOCATION_CONFIG) as Location[]).map((location, index) => (
                  <GradientCard
                    key={location}
                    onClick={() => handleLocationSelect(location)}
                    className="bg-white shadow-soft hover:shadow-md py-6"
                  >
                    <div 
                      className="text-center animate-fade-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-4xl block mb-2">
                        {LOCATION_CONFIG[location].emoji}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {LOCATION_CONFIG[location].label}
                      </span>
                    </div>
                  </GradientCard>
                ))}
              </div>
            </div>
          </ScreenTransition>
        )}

        {/* Compulsion Selection */}
        {step === "compulsion" && selectedLocation && (
          <ScreenTransition>
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground text-center">
                Don't hesitate to share what was on your mind 🌟
              </p>

              {/* Custom location input for "other" */}
              {selectedLocation === "other" && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Where were you?
                  </p>
                  <input
                    type="text"
                    value={customLocationName}
                    onChange={(e) => setCustomLocationName(e.target.value)}
                    placeholder="Enter your location..."
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}

              {/* Previous entries for this location - only show if not "other" */}
              {selectedLocation !== "other" && previousCompulsions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Previously logged at {LOCATION_CONFIG[selectedLocation].label}
                  </p>
                  <div className="space-y-2">
                    {previousCompulsions.map((compulsion, index) => (
                      <GradientCard
                        key={compulsion}
                        onClick={() => handleCompulsionSelect(compulsion)}
                        className="bg-white shadow-soft hover:shadow-md py-3"
                      >
                        <div 
                          className="flex items-center gap-3 animate-fade-slide-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center">
                            <span className="text-white text-sm">
                              {LOCATION_CONFIG[selectedLocation].emoji}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {compulsion}
                          </span>
                        </div>
                      </GradientCard>
                    ))}
                  </div>
                </div>
              )}

              {/* Predefined options - only show if not "other" location */}
              {selectedLocation !== "other" && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Or select from common patterns
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {predefinedOptions.slice(0, 4).map((compulsion) => (
                      <button
                        key={compulsion}
                        onClick={() => handleCompulsionSelect(compulsion)}
                        className="px-4 py-2 bg-primary/10 text-primary text-sm rounded-full transition-all hover:bg-primary/20 active:scale-95"
                      >
                        {compulsion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom input */}
              <div className="space-y-3">
                {selectedLocation === "other" ? (
                  // For "other" location, always show the input
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      What urge or thought showed up?
                    </p>
                    <input
                      type="text"
                      value={customCompulsion}
                      onChange={(e) => setCustomCompulsion(e.target.value)}
                      placeholder="Describe what was on your mind..."
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      autoFocus
                    />
                    <button
                      onClick={handleCustomCompulsionAdd}
                      disabled={!customCompulsion.trim()}
                      className="w-full py-3 gradient-purple text-white font-medium rounded-xl disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  // For other locations, show toggle button
                  !showCustomInput ? (
                    <button
                      onClick={() => setShowCustomInput(true)}
                      className="w-full py-3 border-2 border-dashed border-primary/30 text-primary text-sm rounded-2xl transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      + Add something else
                    </button>
                  ) : (
                    <div className="space-y-3 animate-scale-in">
                      <input
                        type="text"
                        value={customCompulsion}
                        onChange={(e) => setCustomCompulsion(e.target.value)}
                        placeholder="Describe what was on your mind..."
                        className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        autoFocus
                      />
                      <button
                        onClick={handleCustomCompulsionAdd}
                        disabled={!customCompulsion.trim()}
                        className="w-full py-3 gradient-purple text-white font-medium rounded-xl disabled:opacity-50 transition-all active:scale-[0.98]"
                      >
                        Continue
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </ScreenTransition>
        )}

        {/* Response Selection */}
        {step === "response" && (
          <ScreenTransition>
            <div className="space-y-5">
              <GradientCard className="bg-white/80 shadow-soft">
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">You're logging:</p>
                  <p className="font-medium text-foreground mt-1">{selectedCompulsion}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedLocation && LOCATION_CONFIG[selectedLocation].emoji} {selectedLocation && LOCATION_CONFIG[selectedLocation].label}
                  </p>
                </div>
              </GradientCard>

              <p className="text-sm text-muted-foreground text-center">
                How did you respond to the urge?
              </p>

              <div className="space-y-3">
                {(Object.keys(RESPONSE_CONFIG) as ResponseType[]).map((response, index) => (
                  <GradientCard
                    key={response}
                    onClick={() => handleResponseSelect(response)}
                    className="bg-white shadow-soft hover:shadow-md"
                  >
                    <div 
                      className="flex items-center gap-4 py-2 animate-fade-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${RESPONSE_CONFIG[response].color}`}>
                        <span className="text-white text-xl">
                          {RESPONSE_CONFIG[response].emoji}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {RESPONSE_CONFIG[response].label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {response === "acted" && "I performed the compulsion"}
                          {response === "delayed" && "I waited before responding"}
                          {response === "resisted" && "I didn't perform the compulsion"}
                        </p>
                      </div>
                    </div>
                  </GradientCard>
                ))}
              </div>
            </div>
          </ScreenTransition>
        )}

        {/* Confirmation */}
        {step === "confirmation" && (
          <ScreenTransition>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 rounded-full gradient-purple flex items-center justify-center mb-6 animate-bounce-in shadow-glow-lg">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2 animate-fade-slide-up">
                Entry Saved! ✨
              </h2>
              
              <p className="text-center text-muted-foreground animate-fade-slide-up" style={{ animationDelay: "100ms" }}>
                Check weekly for insights 📊
              </p>
            </div>
          </ScreenTransition>
        )}

        {/* Weekly Insights */}
        {step === "weekly" && (
          <WeeklyInsightCard 
            getWeeklyInsight={getWeeklyInsight}
            getAvailableWeeks={getAvailableWeeks}
            currentWeek={currentWeek}
          />
        )}
      </div>
    </div>
  );
};

export default OCDMomentTracker;
