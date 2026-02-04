import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Location = "home" | "work" | "social" | "other";
export type ResponseType = "acted" | "delayed" | "resisted";

// Map UI response types to database values
const RESPONSE_TYPE_MAP: Record<ResponseType, string> = {
  acted: "acted",
  delayed: "waited",
  resisted: "noticed_without_acting",
};

export interface OCDMoment {
  id: string;
  user_id: string;
  location: string;
  urge: string;
  response_type: string;
  created_at: string;
}

export const useOCDMomentSupabase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousUrges, setPreviousUrges] = useState<string[]>([]);

  // Fetch previous urges for a location (demo mode: no user filtering)
  const fetchUrgesByLocation = useCallback(async (location: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ocd_moments")
        .select("urge")
        .eq("location", location)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching urges:", error);
        setPreviousUrges([]);
        return;
      }

      // Get unique urges
      const uniqueUrges = [...new Set(data?.map(item => item.urge) || [])];
      setPreviousUrges(uniqueUrges);
    } catch (error) {
      console.error("Error fetching urges:", error);
      setPreviousUrges([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit a new OCD moment entry (demo mode: no user_id)
  const submitOCDMoment = useCallback(async (
    location: string,
    urge: string,
    responseType: ResponseType
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("ocd_moments")
        .insert({
          location: location,
          urge: urge,
          response_type: RESPONSE_TYPE_MAP[responseType],
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error saving OCD moment:", error);
        toast({
          title: "Error saving entry",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error saving OCD moment:", error);
      toast({
        title: "Error saving entry",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Fetch weekly data for insights (demo mode: no user filtering)
  const fetchWeeklyData = useCallback(async (weekStart: Date, weekEnd: Date) => {
    try {
      const { data, error } = await supabase
        .from("ocd_moments")
        .select("*")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching weekly data:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching weekly data:", error);
      return [];
    }
  }, []);

  // Check if user is authenticated (demo mode: always returns true)
  const checkAuth = useCallback(async (): Promise<boolean> => {
    return true;
  }, []);

  return {
    isLoading,
    isSubmitting,
    previousUrges,
    fetchUrgesByLocation,
    submitOCDMoment,
    fetchWeeklyData,
    checkAuth,
  };
};

export default useOCDMomentSupabase;
