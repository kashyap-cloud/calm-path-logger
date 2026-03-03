import React, { useState } from "react";
import ScreenTransition from "../trackers/ScreenTransition";
import GradientCard from "../trackers/GradientCard";

interface WeeklyInsightCardProps {
  getWeeklyInsight: (week: number) => { 
    summary: string; 
    dominantPattern: string;
    actedPercent: number;
    delayedPercent: number;
    resistedPercent: number;
    allActed: boolean;
  } | null;
  getAvailableWeeks: () => number[];
  currentWeek: number;
}

const WeeklyInsightCard: React.FC<WeeklyInsightCardProps> = ({
  getWeeklyInsight,
  getAvailableWeeks,
  currentWeek,
}) => {
  const availableWeeks = getAvailableWeeks();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  
  const insight = getWeeklyInsight(selectedWeek);

  const getWeekLabel = (week: number): string => {
    if (week === currentWeek) return "This Week";
    if (week === currentWeek - 1) return "Last Week";
    if (week === currentWeek - 2) return "2 Weeks Ago";
    return `Week ${week}`;
  };

  return (
    <ScreenTransition>
      <div className="space-y-5">
        {/* Week Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {availableWeeks.map((week) => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedWeek === week
                  ? "gradient-purple text-white shadow-glow"
                  : "bg-white text-foreground shadow-soft hover:shadow-md"
              }`}
            >
              {getWeekLabel(week)}
            </button>
          ))}
        </div>

        {/* Insight Card */}
        {insight ? (
          <GradientCard className="bg-gradient-to-br from-white via-tracker-moment-light to-white shadow-soft-lg">
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {getWeekLabel(selectedWeek)} Insight
                  </p>
                  <p className="font-semibold text-foreground">
                    {insight.dominantPattern === "mixed" ? "Mixed Responses" : 
                     insight.dominantPattern === "act-dominated" ? "Immediate Reactions" :
                     insight.dominantPattern === "delay-dominated" ? "Thoughtful Pauses" :
                     "Strong Resistance"}
                  </p>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-foreground text-sm leading-relaxed">
                  {insight.summary}
                </p>
              </div>
            </div>
          </GradientCard>
        ) : (
          <GradientCard className="bg-white shadow-soft">
            <div className="py-8 text-center">
              <span className="text-4xl mb-4 block">📝</span>
              <p className="text-foreground font-medium">No moments noted</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start logging to see your weekly insights
              </p>
            </div>
          </GradientCard>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Insights are neutral observations, not evaluations.
          <br />Every response is valid. 🌱
        </p>
      </div>
    </ScreenTransition>
  );
};

export default WeeklyInsightCard;
