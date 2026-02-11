import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export const useInterferenceSupabase = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weeklyData, setWeeklyData] = useState<InterferenceRow[]>([]);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);

  const currentWeekStart = useMemo(() => getWeekStart(new Date()), []);
  const currentWeekEnd = useMemo(() => getWeekEnd(currentWeekStart), [currentWeekStart]);

  /** Insert a daily check-in row */
  const submitCheckin = useCallback(
    async (values: {
      workStudy: number | null;
      relationships: number | null;
      sleepRoutine: number | null;
      selfCare: number | null;
    }) => {
      setIsSubmitting(true);
      try {
        const { error } = await supabase.from("daily_interference").insert({
          work_study: values.workStudy,
          relationships_social: values.relationships,
          sleep_routine: values.sleepRoutine,
          self_care: values.selfCare,
        });
        if (error) {
          console.log("Insert error:", error);
          return false;
        }
        return true;
      } catch (err) {
        console.log("Submit error:", err);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  /** Fetch this week's entries */
  const fetchWeeklyData = useCallback(async () => {
    setIsLoadingWeekly(true);
    try {
      const { data, error } = await supabase
        .from("daily_interference")
        .select("*")
        .gte("date", formatDate(currentWeekStart))
        .lte("date", formatDate(currentWeekEnd))
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
  }, [currentWeekStart, currentWeekEnd]);

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
    const vals = [
      weeklyAverages.workStudy,
      weeklyAverages.relationships,
      weeklyAverages.sleepRoutine,
      weeklyAverages.selfCare,
    ].filter((v): v is number => v !== null);

    if (vals.length === 0) return null;

    const high = vals.filter((v) => v >= 7).length;
    const low = vals.filter((v) => v <= 4).length;

    if (high >= Math.ceil(vals.length / 2)) {
      return "OCD significantly interfered with daily life this week.";
    }
    if (low >= Math.ceil(vals.length / 2)) {
      return "Lower interference observed across most areas.";
    }
    return "OCD had varied impact across life areas this week.";
  }, [weeklyAverages]);

  return {
    submitCheckin,
    isSubmitting,
    weeklyData,
    weeklyAverages,
    weeklySummary,
    isLoadingWeekly,
    refetchWeekly: fetchWeeklyData,
  };
};
