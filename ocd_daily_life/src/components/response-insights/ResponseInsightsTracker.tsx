import React, { useState } from "react";
import BackButton from "../trackers/BackButton";
import ScreenTransition from "../trackers/ScreenTransition";
import GradientCard from "../trackers/GradientCard";
import useResponseInsights, { WeekWindow } from "@/hooks/useResponseInsights";
import { RESPONSE_TYPE_DISPLAY } from "@/hooks/useOCDMomentSupabase";
import { Calendar, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ResponseInsightsTrackerProps {
  onClose: () => void;
}

const isPaidUser = false;

// Map DB response_type to UI display
const RESPONSE_LABELS: Record<string, { symbol: string; label: string }> = {
  acted: { symbol: "●", label: "Acting on the urge" },
  waited: { symbol: "◐", label: "Waiting" },
  noticed_without_acting: { symbol: "○", label: "Noticed without acting" },
};

const RESPONSE_BADGE_COLORS: Record<string, string> = {
  acted: "bg-response-acted text-white",
  waited: "bg-response-delayed text-foreground",
  noticed_without_acting: "bg-response-resisted text-white",
};

const ResponseInsightsTracker: React.FC<ResponseInsightsTrackerProps> = ({ onClose }) => {
  const { weekWindows, selectedWeek, setSelectedWeek, entries, insight, isLoading } = useResponseInsights();
  const [showEntries, setShowEntries] = useState(false);

  const handleWeekChange = (key: WeekWindow) => {
    setSelectedWeek(key);
    setShowEntries(false);
  };

  const getResponseColor = (responseType: string) => {
    return RESPONSE_BADGE_COLORS[responseType] || "bg-muted";
  };

  const getResponseLabel = (responseType: string) => {
    return RESPONSE_LABELS[responseType]?.label || responseType;
  };

  const formatEntryDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, h:mm a");
    } catch {
      return dateStr;
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
              {weekWindows.map((week) => (
                <button
                  key={week.key}
                  onClick={() => handleWeekChange(week.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedWeek === week.key
                      ? "gradient-amber text-white shadow-glow"
                      : "bg-white text-foreground shadow-soft"
                    }`}
                >
                  {week.label}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Loading insights...</span>
              </div>
            ) : insight?.tier === "empty" || !insight ? (
              <GradientCard className="bg-white shadow-soft">
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">No Data for this Period</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[240px] mx-auto">
                      Entries from the "OCD Moment" tracker will appear here to provide insights.
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs bg-amber-50 text-amber-700 px-4 py-2 rounded-lg inline-block border border-amber-100">
                      ⚠️ Disclaimer: Insights require at least 1 entry to show summary, and 4 entries for pattern analysis.
                    </p>
                  </div>
                </div>
              </GradientCard>
            ) : (
              <GradientCard className="bg-gradient-to-br from-white via-tracker-insights-light to-white shadow-soft-lg">
                <div className="py-4 space-y-4">
                  {/* Summary */}
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full gradient-amber flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-2xl">💡</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground leading-tight">{insight.summary}</p>
                      {insight.tier === "few" && (
                        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-2 border border-amber-100/50">
                          Note: Add {4 - entries.length} more entries for full pattern analysis.
                        </p>
                      )}
                      {insight.secondaryText && (
                        <p className="text-xs text-muted-foreground mt-1">{insight.secondaryText}</p>
                      )}
                    </div>
                  </div>

                  {/* Response Patterns */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Response Patterns Observed</p>

                    {(() => {
                      const responses = [
                        { key: "acted", label: `${RESPONSE_LABELS.acted.symbol} ${RESPONSE_LABELS.acted.label}`, count: insight.actedCount, bgClass: "bg-response-acted/20" },
                        { key: "waited", label: `${RESPONSE_LABELS.waited.symbol} ${RESPONSE_LABELS.waited.label}`, count: insight.delayedCount, bgClass: "bg-response-delayed/20" },
                        { key: "noticed_without_acting", label: `${RESPONSE_LABELS.noticed_without_acting.symbol} ${RESPONSE_LABELS.noticed_without_acting.label}`, count: insight.resistedCount, bgClass: "bg-response-resisted/20" },
                      ].filter((r) => r.count > 0).sort((a, b) => b.count - a.count);

                      const qualitativeLabels = ["More often", "Sometimes", "Less often"];

                      return responses.map((response, index) => (
                        <div key={response.key} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-xl">
                          <span className="text-foreground font-medium text-sm">{response.label}</span>
                          {insight.showFrequencyLabels && (
                            <span className={`text-foreground font-semibold text-sm ${response.bgClass} px-3 py-1 rounded-full`}>
                              {qualitativeLabels[index]}
                            </span>
                          )}
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Session Promotion Card */}
                  {insight.allActed && insight.tier === "full" && (
                    <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10 rounded-xl p-4 mt-4 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-sm mb-1">Want personalized support?</p>
                          <p className="text-xs text-muted-foreground mb-3">Work with a therapist to develop strategies for managing urges.</p>
                          <button className="w-full py-2.5 gradient-purple text-white font-medium rounded-xl text-sm transition-all hover:shadow-lg">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Book an appointment with the ERP therapist
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Past Entries Button */}
                  {entries.length > 0 && !showEntries && (
                    <button
                      onClick={() => setShowEntries(true)}
                      className="w-full py-3 bg-white/80 text-accent font-medium rounded-xl transition-all hover:bg-white"
                    >
                      View past logged entries ({entries.length})
                    </button>
                  )}

                  {/* Past Entries List */}
                  {showEntries && entries.length > 0 && (
                    <div className="space-y-2 animate-scale-in">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Past Entries</p>
                        <button onClick={() => setShowEntries(false)} className="text-xs text-accent font-medium">
                          Hide
                        </button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        {entries.map((entry, index) => (
                          <div
                            key={entry.id}
                            className="bg-white rounded-xl p-3 flex items-center justify-between shadow-soft"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{entry.urge}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.location === "other" && entry.custom_location
                                  ? entry.custom_location
                                  : entry.location}{" "}
                                · {formatEntryDate(entry.created_at)}
                              </p>
                            </div>
                            <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getResponseColor(entry.response_type)}`}>
                              {getResponseLabel(entry.response_type)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
