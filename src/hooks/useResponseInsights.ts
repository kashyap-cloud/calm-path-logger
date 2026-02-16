import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OCDMomentEntry } from "@/hooks/useOCDMomentSupabase";
import { useTokenAuth } from "@/contexts/TokenAuthContext";



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

const generateInsight = (
  acted: number,
  delayed: number,
  resisted: number,
  total: number
): WeekInsight => {
  const allActed = acted === total;

  if (total === 0) {
    return { tier: "empty", summary: "", secondaryText: "", dominantPattern: "", actedCount: 0, delayedCount: 0, resistedCount: 0, showFrequencyLabels: false, allActed: false };
  }

  if (total <= 3) {
    const summaries = [
      "You're beginning to observe your responses.",
      "Every entry builds awareness.",
    ];
    return {
      tier: "few",
      summary: summaries[Math.floor(Math.random() * summaries.length)],
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

export const useResponseInsights = () => {
  const weekWindows = useMemo(() => getWeekWindows(), []);
  const [selectedWeek, setSelectedWeek] = useState<WeekWindow>("this_week");
  const [entries, setEntries] = useState<OCDMomentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<WeekInsight | null>(null);
  const { userId } = useTokenAuth();

  const selectedWindow = useMemo(
    () => weekWindows.find((w) => w.key === selectedWeek)!,
    [weekWindows, selectedWeek]
  );

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (!userId) {
        setEntries([]);
        setInsight(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("ocd_moments")
          .select("*")
          .eq("user_id", userId)
          .gte("created_at", selectedWindow.startDate.toISOString())
          .lte("created_at", selectedWindow.endDate.toISOString())
          .order("created_at", { ascending: false });

        if (cancelled) return;

        if (error) {
          console.log("Error fetching insights entries:", error);
          setEntries([]);
          setInsight(null);
          setIsLoading(false);
          return;
        }

        const fetched = data || [];
        setEntries(fetched);

        const acted = fetched.filter((e) => e.response_type === "acted").length;
        const delayed = fetched.filter((e) => e.response_type === "waited").length;
        const resisted = fetched.filter((e) => e.response_type === "noticed_without_acting").length;

        setInsight(generateInsight(acted, delayed, resisted, fetched.length));
      } catch (err) {
        console.log("Error fetching insights:", err);
        if (!cancelled) {
          setEntries([]);
          setInsight(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [selectedWindow, userId]);

  return {
    weekWindows,
    selectedWeek,
    setSelectedWeek,
    entries,
    insight,
    isLoading,
  };
};

export default useResponseInsights;
