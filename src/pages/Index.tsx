import React, { useState } from "react";
import ResponsiveContainer from "@/components/layout/ResponsiveContainer";
import TrackerButton from "@/components/trackers/TrackerButton";
import ScreenTransition from "@/components/trackers/ScreenTransition";
import OCDMomentTracker from "@/components/ocd-moment/OCDMomentTracker";
import ResponseInsightsTracker from "@/components/response-insights/ResponseInsightsTracker";
import InterferenceTracker from "@/components/interference/InterferenceTracker";

import CommunityFeed from "@/components/community/CommunityFeed";
import TherapistPlaceholder from "@/components/placeholders/TherapistPlaceholder";
import ProfilePlaceholder from "@/components/placeholders/ProfilePlaceholder";
import { Brain, Lightbulb, BarChart3 } from "lucide-react";

type ActiveTracker = null | "moment" | "insights" | "interference";
type NavTab = "home" | "community" | "therapist" | "profile";

const Index = () => {
  const [activeTracker, setActiveTracker] = useState<ActiveTracker>(null);
  const [activeTab, setActiveTab] = useState<NavTab>("home");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tracker = params.get("tracker");
    if (tracker === "moment" || tracker === "insights" || tracker === "interference") {
      setActiveTracker(tracker as ActiveTracker);
    }
  }, []);

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

  const renderTabContent = () => {
    // If a tracker is active, show it
    if (activeTracker) {
      return renderActiveTracker();
    }

    switch (activeTab) {
      case "community":
        return <CommunityFeed />;
      case "therapist":
        return <TherapistPlaceholder />;
      case "profile":
        return <ProfilePlaceholder />;
      case "home":
      default:
        return (
          <div className="min-h-screen pb-24 sm:pb-28">
            {/* Hero Header */}
            <div className="gradient-hero pt-12 sm:pt-16 pb-8 sm:pb-10 px-5 sm:px-8 rounded-b-[2rem]">
              <ScreenTransition>
                <div className="text-center text-white">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">OCD Trackers</h1>
                  <p className="text-white/80 text-sm sm:text-base">Supporting awareness of thoughts, urges, and responses</p>
                </div>
              </ScreenTransition>
            </div>

            {/* Main Content */}
            <div className="px-5 sm:px-8 py-8">
              <ScreenTransition delay={100}>
                <div className="mb-8">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Trackers</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Tap to log or view insights</p>
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
                <div className="mt-8 space-y-3 text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Tips</p>
                  <div className="flex justify-center gap-3 pb-2">
                    {["Log moments as they happen", "Check insights weekly"].map((tip, i) => (
                      <div key={i} className="bg-white rounded-xl px-4 py-3 shadow-soft">
                        <p className="text-sm text-foreground whitespace-nowrap">💡 {tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScreenTransition>
            </div>
          </div>
        );
    }
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTracker(null); // Reset tracker when switching tabs
    setActiveTab(tab);
  };

  return (
    <ResponsiveContainer>
      <div className="relative min-h-screen">
        {renderTabContent()}
      </div>
    </ResponsiveContainer>
  );
};

export default Index;
