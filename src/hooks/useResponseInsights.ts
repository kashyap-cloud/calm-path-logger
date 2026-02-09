import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTokenAuth } from "@/contexts/TokenAuthContext";
import { OCDMomentEntry, RESPONSE_TYPE_DISPLAY } from "@/hooks/useOCDMomentSupabase";

const DEMO_USER_ID = "demo-user";

export type WeekWindow = "this_week" | "last_week" | "two_weeks_ago";

export interface WeekOption {
  key: WeekWindow;
  label: string;
  startDate: Date;
  endDate: Date;
}

export interface WeekInsight {
  summary: string;
  dominantPattern: string;
  actedPercent: number;
  delayedPercent: number;
  resistedPercent: number;
  allActed: boolean;
}

const getWeekWindows = (): WeekOption[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - mondayOffset);
  thisMonday.setHours(0, 0, 0, 0);

  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  const twoWeeksMonday = new Date(thisMonday);
  twoWeeksMonday.setDate(thisMonday.getDate() - 14);

  const endOfDay = (d: Date) => {
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  return [
    { key: "this_week", label: "This Week", startDate: thisMonday, endDate: today },
    { key: "last_week", label: "Last Week", startDate: lastMonday, endDate: endOfDay(lastMonday) },
    { key: "two_weeks_ago", label: "2 Weeks Ago", startDate: twoWeeksMonday, endDate: endOfDay(twoWeeksMonday) },
  ];
};

const generateInsight = (
  acted: number,
  delayed: number,
  resisted: number,
  total: number
): WeekInsight => {
  const actedPercent = Math.round((acted / total) * 100);
  const delayedPercent = Math.round((delayed / total) * 100);
  const resistedPercent = Math.round((resisted / total) * 100);
  const allActed = acted === total;

  let dominantPattern = "mixed";
  let summary = "";

  if (acted > delayed && acted > resisted) {
    dominantPattern = "act-dominated";
    summary = "Your responses were mostly immediate reactions this week.";
  } else if (delayed > acted && delayed > resisted) {
    dominantPattern = "delay-dominated";
    summary = "You showed moments of pause before responding this week.";
  } else if (resisted > acted && resisted > delayed) {
    dominantPattern = "resist-dominated";
    summary = "You noticed urges without acting on them most often this week.";
  } else {
    dominantPattern = "mixed";
    summary = "You showed a mix of responses this week.";
  }

  return { summary, dominantPattern, actedPercent, delayedPercent, resistedPercent, allActed };
};

export const useResponseInsights = () => {
  const { userId } = useTokenAuth();
  const isDemoMode = userId === DEMO_USER_ID;

  const weekWindows = getWeekWindows();
  const [selectedWeek, setSelectedWeek] = useState<WeekWindow>("this_week");
  const [entries, setEntries] = useState<OCDMomentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<WeekInsight | null>(null);

  const selectedWindow = weekWindows.find((w) => w.key === selectedWeek)!;

  const fetchEntriesForWeek = useCallback(
    async (window: WeekOption) => {
      if (!userId) return;

      setIsLoading(true);
      try {
        let query = supabase
          .from("ocd_moments")
          .select("*")
          .gte("created_at", window.startDate.toISOString())
          .lte("created_at", window.endDate.toISOString())
          .order("created_at", { ascending: false });

        if (!isDemoMode && userId) {
          query = query.eq("user_id", userId);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching insights entries:", error);
          setEntries([]);
          setInsight(null);
          return;
        }

        const fetched = data || [];
        setEntries(fetched);

        if (fetched.length === 0) {
          setInsight(null);
          return;
        }

        // Count by response_type (DB values: acted, waited, noticed_without_acting)
        const acted = fetched.filter((e) => e.response_type === "acted").length;
        const delayed = fetched.filter((e) => e.response_type === "waited").length;
        const resisted = fetched.filter((e) => e.response_type === "noticed_without_acting").length;

        setInsight(generateInsight(acted, delayed, resisted, fetched.length));
      } catch (error) {
        console.error("Error fetching insights:", error);
        setEntries([]);
        setInsight(null);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, isDemoMode]
  );

  useEffect(() => {
    fetchEntriesForWeek(selectedWindow);
  }, [selectedWeek, fetchEntriesForWeek, selectedWindow]);

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
