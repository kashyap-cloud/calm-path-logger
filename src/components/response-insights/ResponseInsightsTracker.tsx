import React, { useState } from "react";
import BackButton from "../trackers/BackButton";
import ScreenTransition from "../trackers/ScreenTransition";
import GradientCard from "../trackers/GradientCard";
import useTrackerData, { LOCATION_CONFIG, RESPONSE_CONFIG } from "@/hooks/useTrackerData";
import { Calendar, Sparkles } from "lucide-react";

interface ResponseInsightsTrackerProps {
  onClose: () => void;
}

// Mock: In real app, this would come from user auth/subscription status
const isPaidUser = false;

const ResponseInsightsTracker: React.FC<ResponseInsightsTrackerProps> = ({ onClose }) => {
  const { getWeeklyInsight, getAvailableWeeks, currentWeek, getEntriesByWeek } = useTrackerData();
  const availableWeeks = getAvailableWeeks();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  
  const insight = getWeeklyInsight(selectedWeek);
  const entries = getEntriesByWeek(selectedWeek);
  const [showEntries, setShowEntries] = useState(false);
  
  // Get up to 10 entries with a mix based on response distribution
  const displayEntries = entries.slice(0, 10);

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

  const getResponseColor = (response: string) => {
    switch (response) {
      case "acted": return "bg-response-acted text-white";
      case "delayed": return "bg-response-delayed text-foreground";
      case "resisted": return "bg-response-resisted text-white";
      default: return "bg-muted";
    }
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
                  onClick={() => { setSelectedWeek(week); setShowEntries(false); }}
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

                  {/* Response Patterns - Qualitative */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Response Patterns Observed</p>
                    
                    {/* Acted */}
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-xl">
                      <span className="text-foreground font-medium text-sm">● Acting on the urge</span>
                      <span className="text-foreground font-semibold text-sm bg-response-acted/20 px-3 py-1 rounded-full">
                        {insight.actedPercent >= 50 ? "More often" : insight.actedPercent >= 20 ? "Sometimes" : "Less often"}
                      </span>
                    </div>

                    {/* Delayed */}
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-xl">
                      <span className="text-foreground font-medium text-sm">◐ Waiting</span>
                      <span className="text-foreground font-semibold text-sm bg-response-delayed/20 px-3 py-1 rounded-full">
                        {insight.delayedPercent >= 50 ? "More often" : insight.delayedPercent >= 20 ? "Sometimes" : "Less often"}
                      </span>
                    </div>

                    {/* Resisted */}
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-xl">
                      <span className="text-foreground font-medium text-sm">○ Noticed without acting</span>
                      <span className="text-foreground font-semibold text-sm bg-response-resisted/20 px-3 py-1 rounded-full">
                        {insight.resistedPercent >= 50 ? "More often" : insight.resistedPercent >= 20 ? "Sometimes" : "Less often"}
                      </span>
                    </div>
                  </div>

                  {/* Session Promotion Card */}
                  {insight.allActed && (
                    <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10 rounded-xl p-4 mt-4 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          {isPaidUser ? (
                            <>
                              <p className="font-semibold text-foreground text-sm mb-1">
                                Ready to strengthen your response?
                              </p>
                              <p className="text-xs text-muted-foreground mb-3">
                                A session with your therapist can help build on your awareness.
                              </p>
                              <button className="w-full py-2.5 gradient-purple text-white font-medium rounded-xl text-sm transition-all hover:shadow-lg">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Book a Session
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-foreground text-sm mb-1">
                                Want personalized support?
                              </p>
                              <p className="text-xs text-muted-foreground mb-3">
                                Work with a therapist to develop strategies for managing urges.
                              </p>
                              <button className="w-full py-2.5 gradient-purple text-white font-medium rounded-xl text-sm transition-all hover:shadow-lg">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Book an appointment with the ERP therapist
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Past Entries Button */}
                  {displayEntries.length > 0 && !showEntries && (
                    <button
                      onClick={() => setShowEntries(true)}
                      className="w-full py-3 bg-white/80 text-accent font-medium rounded-xl transition-all hover:bg-white"
                    >
                      View past logged entries
                    </button>
                  )}

                  {/* Past Entries List */}
                  {showEntries && displayEntries.length > 0 && (
                    <div className="space-y-2 animate-scale-in">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Past Entries</p>
                        <button 
                          onClick={() => setShowEntries(false)}
                          className="text-xs text-accent font-medium"
                        >
                          Hide
                        </button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        {displayEntries.map((entry, index) => (
                          <div 
                            key={entry.id} 
                            className="bg-white rounded-xl p-3 flex items-center justify-between shadow-soft"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{LOCATION_CONFIG[entry.location].emoji}</span>
                              <div>
                                <p className="text-sm font-medium text-foreground">{entry.compulsion}</p>
                                <p className="text-xs text-muted-foreground">{LOCATION_CONFIG[entry.location].label}</p>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getResponseColor(entry.response)}`}>
                              {RESPONSE_CONFIG[entry.response].label}
                            </span>
                          </div>
                        ))}
                      </div>
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

          </div>
        </ScreenTransition>
      </div>
    </div>
  );
};

export default ResponseInsightsTracker;
