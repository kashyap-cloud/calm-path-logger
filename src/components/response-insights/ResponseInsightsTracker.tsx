import React, { useState } from "react";
import BackButton from "../trackers/BackButton";
import ScreenTransition from "../trackers/ScreenTransition";
import GradientCard from "../trackers/GradientCard";
import useTrackerData from "@/hooks/useTrackerData";

interface ResponseInsightsTrackerProps {
  onClose: () => void;
}

const ResponseInsightsTracker: React.FC<ResponseInsightsTrackerProps> = ({ onClose }) => {
  const { getWeeklyInsight, getAvailableWeeks, currentWeek, getEntriesByWeek } = useTrackerData();
  const availableWeeks = getAvailableWeeks();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  
  const insight = getWeeklyInsight(selectedWeek);
  const entries = getEntriesByWeek(selectedWeek);
  const [showExample, setShowExample] = useState(false);
  
  const exampleEntry = entries.length > 0 ? entries[0] : null;

  const getWeekLabel = (week: number): string => {
    if (week === currentWeek) return "This Week";
    if (week === currentWeek - 1) return "Last Week";
    return `${currentWeek - week} Weeks Ago`;
  };

  const getPatternComparison = () => {
    const lastWeekInsight = getWeeklyInsight(selectedWeek - 1);
    if (!lastWeekInsight || !insight) return null;
    
    if (insight.dominantPattern !== lastWeekInsight.dominantPattern) {
      return "Your response pattern shifted from previous weeks.";
    }
    return "Your response pattern remained consistent.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-tracker-insights-light via-background to-background">
      <div className="gradient-amber pt-10 pb-6 px-5 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <BackButton onClick={onClose} />
          <h1 className="text-lg font-semibold text-white">Response Insights</h1>
        </div>
        <p className="text-white/80 text-sm">Reflections on your logged responses</p>
      </div>

      <div className="px-5 py-6">
        <ScreenTransition>
          <div className="space-y-5">
            {/* Week Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableWeeks.map((week) => (
                <button
                  key={week}
                  onClick={() => { setSelectedWeek(week); setShowExample(false); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedWeek === week
                      ? "gradient-amber text-white shadow-glow"
                      : "bg-white text-foreground shadow-soft"
                  }`}
                >
                  {getWeekLabel(week)}
                </button>
              ))}
            </div>

            {/* Main Insight Card */}
            {insight ? (
              <GradientCard className="bg-gradient-to-br from-white via-tracker-insights-light to-white shadow-soft-lg">
                <div className="py-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full gradient-amber flex items-center justify-center shadow-lg">
                      <span className="text-2xl">💡</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{insight.summary}</p>
                    </div>
                  </div>

                  {getPatternComparison() && (
                    <div className="bg-accent/30 rounded-xl p-3">
                      <p className="text-sm text-foreground/80">{getPatternComparison()}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-accent">
                    <span>🌟</span>
                    <p className="text-sm font-medium">{insight.motivation}</p>
                  </div>

                  {/* See Example Button */}
                  {exampleEntry && !showExample && (
                    <button
                      onClick={() => setShowExample(true)}
                      className="w-full py-3 bg-white/80 text-accent font-medium rounded-xl transition-all hover:bg-white"
                    >
                      See an example
                    </button>
                  )}

                  {/* Example Card */}
                  {showExample && exampleEntry && (
                    <div className="bg-white rounded-xl p-4 animate-scale-in">
                      <p className="text-xs text-muted-foreground uppercase mb-2">Example Moment</p>
                      <p className="text-foreground">
                        <span className="font-medium">
                          {exampleEntry.location === "home" ? "At home" : 
                           exampleEntry.location === "work" ? "At work" : "In social settings"}
                        </span>: You {exampleEntry.response === "acted" ? "acted on" : 
                                      exampleEntry.response === "delayed" ? "delayed" : "resisted"} the urge
                      </p>
                    </div>
                  )}
                </div>
              </GradientCard>
            ) : (
              <GradientCard className="bg-white shadow-soft">
                <div className="py-8 text-center">
                  <span className="text-4xl mb-4 block">📋</span>
                  <p className="text-foreground font-medium">No moments noted</p>
                  <p className="text-sm text-muted-foreground mt-1">Log moments to see insights</p>
                </div>
              </GradientCard>
            )}

            <p className="text-xs text-center text-muted-foreground">
              Insights are observational, not evaluative. 🌱
            </p>
          </div>
        </ScreenTransition>
      </div>
    </div>
  );
};

export default ResponseInsightsTracker;
