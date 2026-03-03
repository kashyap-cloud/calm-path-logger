import { useState, useCallback, useMemo, useEffect } from "react";
import sql from "../lib/db";
import { toast } from "sonner";

export type WeekWindow = "this_week" | "last_week" | "two_weeks_ago";

export interface WeekOption {
    key: WeekWindow;
    label: string;
}

export interface WeeklyAverages {
    workStudy: number | null;
    relationships: number | null;
    sleepRoutine: number | null;
    selfCare: number | null;
}

export interface CheckinEntry {
    id: string;
    user_id: string;
    work_study: number | null;
    relationships: number | null;
    sleep_routine: number | null;
    self_care: number | null;
    created_at: string;
}

const WEEK_WINDOWS: WeekOption[] = [
    { key: "this_week", label: "This Week" },
    { key: "last_week", label: "Last Week" },
    { key: "two_weeks_ago", label: "2 Weeks Ago" },
];

const avg = (values: (number | null)[]): number | null => {
    const valid = values.filter((v): v is number => v !== null);
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
};

export const useInterferenceDB = () => {
    const [entries, setEntries] = useState<CheckinEntry[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<WeekWindow>("this_week");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

    const fetchEntries = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await sql`
                SELECT * FROM interference_checkins 
                WHERE user_id = ${MOCK_USER_ID} 
                ORDER BY created_at DESC
            `;
            setEntries(data as CheckinEntry[]);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load entries from database");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const getWeekRange = useCallback((window: WeekWindow) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const offsets: Record<WeekWindow, [number, number]> = {
            this_week: [7, 0],
            last_week: [14, 7],
            two_weeks_ago: [21, 14],
        };
        const [startOffset, endOffset] = offsets[window];
        const start = new Date(today);
        start.setDate(today.getDate() - startOffset);
        start.setHours(0, 0, 0, 0);
        const end = new Date(today);
        end.setDate(today.getDate() - endOffset);
        return { start, end };
    }, []);

    const weeklyAverages = useMemo((): WeeklyAverages | null => {
        const { start, end } = getWeekRange(selectedWeek);
        const weekEntries = entries.filter((e) => {
            const d = new Date(e.created_at);
            return d >= start && d <= end;
        });
        if (weekEntries.length === 0) return null;
        return {
            workStudy: avg(weekEntries.map((e) => e.work_study)),
            relationships: avg(weekEntries.map((e) => e.relationships)),
            sleepRoutine: avg(weekEntries.map((e) => e.sleep_routine)),
            selfCare: avg(weekEntries.map((e) => e.self_care)),
        };
    }, [entries, selectedWeek, getWeekRange]);

    const weeklySummary = useMemo(() => {
        if (!weeklyAverages) return null;
        const values = [
            weeklyAverages.workStudy,
            weeklyAverages.relationships,
            weeklyAverages.sleepRoutine,
            weeklyAverages.selfCare,
        ].filter((v): v is number => v !== null);
        if (values.length === 0) return null;
        const overall = values.reduce((a, b) => a + b, 0) / values.length;
        if (overall <= 3) return "OCD had minimal impact this week. Keep it up!";
        if (overall <= 6) return "OCD had some impact this week. You're doing okay.";
        return "OCD had a significant impact this week. Consider speaking to your therapist.";
    }, [weeklyAverages]);

    const submitCheckin = useCallback(
        async (data: { workStudy: number | null; relationships: number | null; sleepRoutine: number | null; selfCare: number | null }) => {
            setIsSubmitting(true);
            try {
                const [newEntry] = await sql`
                    INSERT INTO interference_checkins (user_id, work_study, relationships, sleep_routine, self_care)
                    VALUES (${MOCK_USER_ID}, ${data.workStudy}, ${data.relationships}, ${data.sleepRoutine}, ${data.selfCare})
                    RETURNING *
                `;
                setEntries((prev) => [newEntry as CheckinEntry, ...prev]);
                toast.success("Daily entry saved to database");
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

    const refetchWeekly = useCallback(() => {
        fetchEntries();
    }, [fetchEntries]);

    return {
        entries,
        submitCheckin,
        isSubmitting,
        weeklyAverages,
        weeklySummary,
        isLoadingWeekly: isLoading,
        refetchWeekly,
        weekWindows: WEEK_WINDOWS,
        selectedWeek,
        setSelectedWeek,
    };
};

export default useInterferenceDB;
