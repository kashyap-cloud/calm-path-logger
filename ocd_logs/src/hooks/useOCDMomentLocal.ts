import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export type ResponseType = "acted" | "waited" | "noticed_without_acting";

export const RESPONSE_TYPE_DISPLAY: Record<ResponseType, string> = {
    acted: "Acting on the urge",
    waited: "Waiting",
    noticed_without_acting: "Noticed without acting",
};

export interface OCDMomentEntry {
    id: string;
    urge: string;
    location: string;
    custom_location?: string | null;
    response_type: ResponseType;
    created_at: string;
    user_id?: number;
}

const STORAGE_KEY = "ocd_moments_data";

const useOCDMomentLocal = () => {
    const [allEntries, setAllEntries] = useState<OCDMomentEntry[]>([]);
    const [previousEntries, setPreviousEntries] = useState<OCDMomentEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const MOCK_USER_ID = 1; // Temporary fixed user ID

    // Load all entries from LocalStorage
    const fetchAllEntries = useCallback(async () => {
        setIsLoading(true);
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                // Sort by created_at descending
                const sortedData = (parsedData || []).sort((a: OCDMomentEntry, b: OCDMomentEntry) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setAllEntries(sortedData);
            } else {
                setAllEntries([]);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load entries from storage");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchAllEntries();
    }, [fetchAllEntries]);

    // Filter recent entries for a given location
    const fetchRecentEntries = useCallback(
        (location: string) => {
            const filtered = allEntries
                .filter((e) => e.location === location)
                .slice(0, 5);
            setPreviousEntries(filtered);
        },
        [allEntries]
    );

    const submitOCDMoment = useCallback(
        async (
            location: string,
            urge: string,
            response_type: ResponseType,
            custom_location?: string | null
        ) => {
            setIsSubmitting(true);
            try {
                // Simulate a small delay for UI feedback
                await new Promise(resolve => setTimeout(resolve, 500));

                const newEntry: OCDMomentEntry = {
                    id: crypto.randomUUID(),
                    user_id: MOCK_USER_ID,
                    location,
                    urge,
                    response_type,
                    custom_location,
                    created_at: new Date().toISOString(),
                };

                const updatedEntries = [newEntry, ...allEntries];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
                setAllEntries(updatedEntries);

                toast.success("Entry saved locally");
                return true;
            } catch (err) {
                console.error("Submit error:", err);
                toast.error("Failed to save entry");
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [allEntries]
    );

    const deleteOCDMoment = useCallback(async (id: string) => {
        setIsDeleting(true);
        try {
            const updatedEntries = allEntries.filter((e) => e.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
            setAllEntries(updatedEntries);
            toast.success("Entry deleted");
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Failed to delete entry");
        } finally {
            setIsDeleting(false);
        }
    }, [allEntries]);

    return {
        entries: allEntries,
        allEntries,
        previousEntries,
        isLoading,
        isSubmitting,
        isDeleting,
        fetchRecentEntries,
        fetchAllEntries,
        submitOCDMoment,
        deleteOCDMoment,
    };
};

export default useOCDMomentLocal;
