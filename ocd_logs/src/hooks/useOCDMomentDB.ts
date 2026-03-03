import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import sql from "../lib/db";

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
    user_id?: string;
}

const useOCDMomentDB = () => {
    const [allEntries, setAllEntries] = useState<OCDMomentEntry[]>([]);
    const [previousEntries, setPreviousEntries] = useState<OCDMomentEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Using the demo user ID from the SQL script
    const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

    const fetchAllEntries = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await sql`
                SELECT * FROM ocd_moments 
                WHERE user_id = ${MOCK_USER_ID} 
                ORDER BY created_at DESC
            `;

            setAllEntries(data as OCDMomentEntry[]);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load entries from database");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllEntries();
    }, [fetchAllEntries]);

    const fetchRecentEntries = useCallback(
        async (location: string) => {
            try {
                const data = await sql`
                    SELECT * FROM ocd_moments 
                    WHERE user_id = ${MOCK_USER_ID} AND location = ${location}
                    ORDER BY created_at DESC
                    LIMIT 5
                `;
                setPreviousEntries(data as OCDMomentEntry[]);
            } catch (err) {
                console.error("Recent entries fetch error:", err);
            }
        },
        []
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
                const [newEntry] = await sql`
                    INSERT INTO ocd_moments (user_id, location, urge, response_type, custom_location)
                    VALUES (${MOCK_USER_ID}, ${location}, ${urge}, ${response_type}, ${custom_location || null})
                    RETURNING *
                `;

                setAllEntries((prev) => [newEntry as OCDMomentEntry, ...prev]);
                toast.success("Entry saved to database");
                return true;
            } catch (err) {
                console.error("Submit error:", err);
                toast.error("Failed to save entry to database");
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        []
    );

    const deleteOCDMoment = useCallback(async (id: string) => {
        setIsDeleting(true);
        try {
            await sql`DELETE FROM ocd_moments WHERE id = ${id} AND user_id = ${MOCK_USER_ID}`;
            setAllEntries((prev) => prev.filter((e) => e.id !== id));
            toast.success("Entry deleted from database");
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Failed to delete entry from database");
        } finally {
            setIsDeleting(false);
        }
    }, []);

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

export default useOCDMomentDB;
