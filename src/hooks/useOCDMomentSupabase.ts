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

export interface OCDMomentEntry {
  id: string;
  user_id: string | null;
  location: string;
  urge: string;
  response_type: string;
  created_at: string;
}

// Reverse map for displaying response types in UI
export const RESPONSE_TYPE_DISPLAY: Record<string, string> = {
  acted: "acted",
  waited: "delayed",
  noticed_without_acting: "resisted",
};

export const useOCDMomentSupabase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousEntries, setPreviousEntries] = useState<OCDMomentEntry[]>([]);

  // Fetch entries by location (exact match, ordered by created_at DESC)
  const fetchEntriesByLocation = useCallback(async (location: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ocd_moments")
        .select("*")
        .eq("location", location)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching entries:", error);
        setPreviousEntries([]);
        return;
      }

      setPreviousEntries(data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setPreviousEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit a new OCD moment entry (demo mode: no user_id)
  const submitOCDMoment = useCallback(async (
    location: string,
    urge: string,
   responseType: ResponseType,
   customLocation?: string | null
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
         custom_location: customLocation || null,
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

  // Check if user is authenticated (demo mode: always returns true)
  const checkAuth = useCallback(async (): Promise<boolean> => {
    return true;
  }, []);

  return {
    isLoading,
    isSubmitting,
    previousEntries,
    fetchEntriesByLocation,
    submitOCDMoment,
    checkAuth,
    RESPONSE_TYPE_DISPLAY,
  };
};

export default useOCDMomentSupabase;
