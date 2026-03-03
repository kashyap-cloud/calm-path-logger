import { useState, useMemo } from "react";
import { OCDMomentEntry } from "@/hooks/useOCDMomentLocal";

export type WeekWindow = "this_week" | "last_week" | "two_weeks_ago";

export interface WeekOption {
  key: WeekWindow;
  label: string;
  startDate: Date;
  endDate: Date;
}

export type InsightTier = "empty" | "few" | "full";

export interface WeekInsight {
  tier: InsightTier;
  summary: string;
  secondaryText: string;
  dominantPattern: string;
  actedCount: number;
  delayedCount: number;
  resistedCount: number;
  showFrequencyLabels: boolean;
  allActed: boolean;
}

const getWeekWindows = (): WeekOption[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const twentyOneDaysAgo = new Date(today);
  twentyOneDaysAgo.setDate(today.getDate() - 21);
  twentyOneDaysAgo.setHours(0, 0, 0, 0);

  return [
    { key: "this_week", label: "This Week", startDate: sevenDaysAgo, endDate: today },
    { key: "last_week", label: "Last Week", startDate: fourteenDaysAgo, endDate: new Date(sevenDaysAgo.getTime() - 1) },
    { key: "two_weeks_ago", label: "2 Weeks Ago", startDate: twentyOneDaysAgo, endDate: new Date(fourteenDaysAgo.getTime() - 1) },
  ];
};

const generateInsight = (acted: number, delayed: number, resisted: number, total: number): WeekInsight => {
  const allActed = acted === total;

  if (total === 0) {
    return { tier: "empty", summary: "", secondaryText: "", dominantPattern: "", actedCount: 0, delayedCount: 0, resistedCount: 0, showFrequencyLabels: false, allActed: false };
  }

  if (total <= 3) {
    return {
      tier: "few",
      summary: "You're beginning to observe your responses.",
      secondaryText: "",
      dominantPattern: "few",
      actedCount: acted,
      delayedCount: delayed,
      resistedCount: resisted,
      showFrequencyLabels: false,
      allActed,
    };
  }

  let dominantPattern = "mixed";
  let summary = "";

  if (acted > delayed && acted > resisted) {
    dominantPattern = "act-dominated";
    summary = "Your responses were mostly immediate reactions this week.";
  } else if (delayed > acted && delayed > resisted) {
    dominantPattern = "delay-dominated";
    summary = "You created pauses before responding more often this week.";
  } else if (resisted > acted && resisted > delayed) {
    dominantPattern = "resist-dominated";
    summary = "You noticed urges without acting more frequently.";
  } else {
    dominantPattern = "mixed";
    summary = "You showed a mix of responses this week.";
  }

  return {
    tier: "full",
    summary,
    secondaryText: "Awareness patterns can shift week to week.",
    dominantPattern,
    actedCount: acted,
    delayedCount: delayed,
    resistedCount: resisted,
    showFrequencyLabels: true,
    allActed,
  };
};

// Accept entries from outside (passed in from OCDMomentTracker's shared state)
export const useResponseInsights = (allEntries: OCDMomentEntry[] = []) => {
  const weekWindows = useMemo(() => getWeekWindows(), []);
  const [selectedWeek, setSelectedWeek] = useState<WeekWindow>("this_week");

  const selectedWindow = useMemo(
    () => weekWindows.find((w) => w.key === selectedWeek)!,
    [weekWindows, selectedWeek]
  );

  const entries = useMemo(() => {
    return allEntries.filter((e) => {
      const d = new Date(e.created_at);
      return d >= selectedWindow.startDate && d <= selectedWindow.endDate;
    });
  }, [allEntries, selectedWindow]);

  const insight = useMemo(() => {
    const acted = entries.filter((e) => e.response_type === "acted").length;
    const delayed = entries.filter((e) => e.response_type === "waited").length;
    const resisted = entries.filter((e) => e.response_type === "noticed_without_acting").length;
    return generateInsight(acted, delayed, resisted, entries.length);
  }, [entries]);

  return {
    weekWindows,
    selectedWeek,
    setSelectedWeek,
    entries,
    insight,
    isLoading: false,
  };
};

export default useResponseInsights;
