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
  custom_location: string | null;
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [previousEntries, setPreviousEntries] = useState<OCDMomentEntry[]>([]);
  const [allEntries, setAllEntries] = useState<OCDMomentEntry[]>([]);

  // Fetch entries by location (exact match, ordered by created_at DESC, with optional limit)
  const fetchEntriesByLocation = useCallback(async (location: string, limit?: number) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("ocd_moments")
        .select("*")
        .eq("location", location)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching entries:", error);
        setPreviousEntries([]);
        setAllEntries([]);
        return;
      }

      if (limit) {
        setPreviousEntries(data || []);
      } else {
        setAllEntries(data || []);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      setPreviousEntries([]);
      setAllEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch recent entries (limited to 10)
  const fetchRecentEntries = useCallback(async (location: string) => {
    return fetchEntriesByLocation(location, 10);
  }, [fetchEntriesByLocation]);

  // Fetch all entries for a location
  const fetchAllEntries = useCallback(async (location: string) => {
    return fetchEntriesByLocation(location);
  }, [fetchEntriesByLocation]);

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

  // Delete an OCD moment entry by ID
  const deleteOCDMoment = useCallback(async (entryId: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("ocd_moments")
        .delete()
        .eq("id", entryId);

      if (error) {
        console.error("Error deleting OCD moment:", error);
        toast({
          title: "Error deleting entry",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Remove from local state
      setPreviousEntries(prev => prev.filter(e => e.id !== entryId));
      setAllEntries(prev => prev.filter(e => e.id !== entryId));

      toast({
        title: "Entry removed",
        description: "Your entry has been deleted.",
      });

      return true;
    } catch (error) {
      console.error("Error deleting OCD moment:", error);
      toast({
        title: "Error deleting entry",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Check if user is authenticated (demo mode: always returns true)
  const checkAuth = useCallback(async (): Promise<boolean> => {
    return true;
  }, []);

  return {
    isLoading,
    isSubmitting,
    isDeleting,
    previousEntries,
    allEntries,
    fetchRecentEntries,
    fetchAllEntries,
    submitOCDMoment,
    deleteOCDMoment,
    checkAuth,
    RESPONSE_TYPE_DISPLAY,
  };
};

export default useOCDMomentSupabase;
