import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTokenAuth } from "@/contexts/TokenAuthContext";
import { toast } from "@/hooks/use-toast";

export interface InterferenceRow {
  id: string;
  created_at: string;
  user_id: string | null;
  date: string;
  work_study: number | null;
  relationships_social: number | null;
  sleep_routine: number | null;
  self_care: number | null;
}

/** Get Monday-based week start for a given date */
const getWeekStart = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1; // shift so Monday=0
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getWeekEnd = (weekStart: Date): Date => {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const formatDate = (d: Date) => d.toISOString().split("T")[0];

export type WeekWindow = "this_week" | "last_week" | "two_weeks_ago";

const getWeekWindows = () => {
  const windows: { key: WeekWindow; label: string; start: Date; end: Date }[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (i * 7));
    const start = getWeekStart(d);
    const end = getWeekEnd(start);
    windows.push({
      key: i === 0 ? "this_week" : i === 1 ? "last_week" : "two_weeks_ago",
      label: i === 0 ? "This Week" : i === 1 ? "Last Week" : "2 Weeks Ago",
      start,
      end
    });
  }
  return windows;
};

export const useInterferenceSupabase = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weeklyData, setWeeklyData] = useState<InterferenceRow[]>([]);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<WeekWindow>("this_week");
  const { userId } = useTokenAuth();

  const weekWindows = useMemo(() => getWeekWindows(), []);
  const activeWindow = useMemo(() => weekWindows.find(w => w.key === selectedWeek)!, [weekWindows, selectedWeek]);

  /** Insert a daily check-in row */
  const submitCheckin = useCallback(
    async (values: {
      workStudy: number | null;
      relationships: number | null;
      sleepRoutine: number | null;
      selfCare: number | null;
    }) => {
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save entries.",
          variant: "destructive",
        });
        return false;
      }

      setIsSubmitting(true);
      try {
        const { error } = await supabase.from("daily_interference").insert({
          user_id: userId,
          work_study: values.workStudy,
          relationships_social: values.relationships,
          sleep_routine: values.sleepRoutine,
          self_care: values.selfCare,
          date: formatDate(new Date()),
        });
        if (error) {
          console.log("Insert error:", error);
          toast({
            title: "Error saving entry",
            description: error.message,
            variant: "destructive",
          });
          return false;
        }

        toast({
          title: "Entry saved",
          description: "Your daily check-in has been recorded.",
        });
        return true;
      } catch (err) {
        console.log("Submit error:", err);
        toast({
          title: "Error saving entry",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [userId]
  );

  /** Fetch entries for selected window */
  const fetchWeeklyData = useCallback(async () => {
    if (!userId) {
      setWeeklyData([]);
      return;
    }

    setIsLoadingWeekly(true);
    try {
      const { data, error } = await supabase
        .from("daily_interference")
        .select("*")
        .eq("user_id", userId)
        .gte("date", formatDate(activeWindow.start))
        .lte("date", formatDate(activeWindow.end))
        .order("date", { ascending: true });

      if (error) {
        console.log("Fetch weekly error:", error);
        setWeeklyData([]);
      } else {
        setWeeklyData((data as InterferenceRow[]) ?? []);
      }
    } catch (err) {
      console.log("Weekly fetch error:", err);
      setWeeklyData([]);
    } finally {
      setIsLoadingWeekly(false);
    }
  }, [activeWindow, userId]);

  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

  /** Compute weekly averages per domain */
  const weeklyAverages = useMemo(() => {
    if (weeklyData.length === 0) return null;

    const avg = (vals: (number | null)[]) => {
      const valid = vals.filter((v): v is number => v !== null);
      if (valid.length === 0) return null;
      return valid.reduce((a, b) => a + b, 0) / valid.length;
    };

    return {
      workStudy: avg(weeklyData.map((r) => r.work_study)),
      relationships: avg(weeklyData.map((r) => r.relationships_social)),
      sleepRoutine: avg(weeklyData.map((r) => r.sleep_routine)),
      selfCare: avg(weeklyData.map((r) => r.self_care)),
    };
  }, [weeklyData]);

  /** Summary text based on averages */
  const weeklySummary = useMemo(() => {
    if (!weeklyAverages) return null;

    const domains = [
      { name: "Work & Study", val: weeklyAverages.workStudy },
      { name: "Relationships", val: weeklyAverages.relationships },
      { name: "Sleep & Routine", val: weeklyAverages.sleepRoutine },
      { name: "Self-Care", val: weeklyAverages.selfCare },
    ].filter(d => d.val !== null) as { name: string; val: number }[];

    if (domains.length === 0) return null;

    const sorted = [...domains].sort((a, b) => b.val - a.val);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];

    if (highest.val >= 7) {
      return `OCD had a high impact this week, particularly affecting your ${highest.name.toLowerCase()}.`;
    }

    if (lowest.val <= 3) {
      return `You're managing well in your ${lowest.name.toLowerCase()}, where OCD had minimal impact.`;
    }

    return "OCD had a moderate, varied impact across your life areas this week.";
  }, [weeklyAverages]);

  return {
    submitCheckin,
    isSubmitting,
    weeklyData,
    weeklyAverages,
    weeklySummary,
    isLoadingWeekly,
    weekWindows,
    selectedWeek,
    setSelectedWeek,
    refetchWeekly: fetchWeeklyData,
  };
};
