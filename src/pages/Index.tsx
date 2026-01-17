import React, { useState } from "react";
import MobileFrame from "@/components/trackers/MobileFrame";
import TrackerButton from "@/components/trackers/TrackerButton";
import ScreenTransition from "@/components/trackers/ScreenTransition";
import OCDMomentTracker from "@/components/ocd-moment/OCDMomentTracker";
import ResponseInsightsTracker from "@/components/response-insights/ResponseInsightsTracker";
import InterferenceTracker from "@/components/interference/InterferenceTracker";
import { Brain, Lightbulb, BarChart3 } from "lucide-react";

type ActiveTracker = null | "moment" | "insights" | "interference";

const Index = () => {
  const [activeTracker, setActiveTracker] = useState<ActiveTracker>(null);

  const renderActiveTracker = () => {
    switch (activeTracker) {
      case "moment":
        return <OCDMomentTracker onClose={() => setActiveTracker(null)} />;
      case "insights":
        return <ResponseInsightsTracker onClose={() => setActiveTracker(null)} />;
      case "interference":
        return <InterferenceTracker onClose={() => setActiveTracker(null)} />;
      default:
        return null;
    }
  };

  return (
    <MobileFrame>
      {activeTracker ? (
        renderActiveTracker()
      ) : (
        <div className="min-h-screen">
          {/* Hero Header */}
          <div className="gradient-hero pt-12 pb-8 px-5 rounded-b-[2rem]">
            <ScreenTransition>
              <div className="text-center text-white">
                <h1 className="text-2xl font-bold mb-1">OCD Mantra</h1>
                <p className="text-white/80 text-sm">Your companion for mindful moments</p>
              </div>
            </ScreenTransition>
          </div>

          {/* Main Content */}
          <div className="px-5 py-8">
            <ScreenTransition delay={100}>
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-1">Trackers</h2>
                <p className="text-sm text-muted-foreground">Tap to log or view insights</p>
              </div>
            </ScreenTransition>

            {/* Tracker Buttons */}
            <ScreenTransition delay={200}>
              <div className="flex justify-center gap-6 mb-10">
                <TrackerButton
                  icon={<Brain className="w-8 h-8" />}
                  label="OCD Moment"
                  gradientClass="gradient-purple"
                  onClick={() => setActiveTracker("moment")}
                />
                <TrackerButton
                  icon={<Lightbulb className="w-8 h-8" />}
                  label="Response Insights"
                  gradientClass="gradient-amber"
                  onClick={() => setActiveTracker("insights")}
                />
                <TrackerButton
                  icon={<BarChart3 className="w-8 h-8" />}
                  label="Daily Life"
                  gradientClass="gradient-teal"
                  onClick={() => setActiveTracker("interference")}
                />
              </div>
            </ScreenTransition>

            {/* Quick Tips */}
            <ScreenTransition delay={300}>
              <div className="mt-8 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Tips</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {["Log moments as they happen", "Check insights weekly"].map((tip, i) => (
                    <div key={i} className="flex-shrink-0 bg-white rounded-xl px-4 py-3 shadow-soft">
                      <p className="text-sm text-foreground whitespace-nowrap">💡 {tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScreenTransition>
          </div>
        </div>
      )}
    </MobileFrame>
  );
};

export default Index;
