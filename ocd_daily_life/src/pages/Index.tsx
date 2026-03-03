import React, { useState } from "react";
import ResponsiveContainer from "@/components/layout/ResponsiveContainer";
import TrackerButton from "@/components/trackers/TrackerButton";
import ScreenTransition from "@/components/trackers/ScreenTransition";
import InterferenceTracker from "@/components/interference/InterferenceTracker";

import CommunityFeed from "@/components/community/CommunityFeed";
import TherapistPlaceholder from "@/components/placeholders/TherapistPlaceholder";
import ProfilePlaceholder from "@/components/placeholders/ProfilePlaceholder";
import { BarChart3 } from "lucide-react";

type ActiveTracker = null | "interference";
type NavTab = "home" | "community" | "therapist" | "profile";

const Index = () => {
  const [activeTracker, setActiveTracker] = useState<ActiveTracker>("interference");
  const [activeTab, setActiveTab] = useState<NavTab>("home");

  const renderActiveTracker = () => {
    switch (activeTracker) {
      case "interference":
        return <InterferenceTracker onClose={() => { }} />;
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
        return null;
    }
  };

  const handleTabChange = (tab: NavTab) => {
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
