import { useState, useCallback, useMemo, useEffect } from "react";
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
    workStudy: number | null;
    relationships: number | null;
    sleepRoutine: number | null;
    selfCare: number | null;
    createdAt: Date;
}

const WEEK_WINDOWS: WeekOption[] = [
    { key: "this_week", label: "This Week" },
    { key: "last_week", label: "Last Week" },
    { key: "two_weeks_ago", label: "2 Weeks Ago" },
];

const STORAGE_KEY = "interference_data";

const avg = (values: (number | null)[]): number | null => {
    const valid = values.filter((v): v is number => v !== null);
    return valid.length > 0 ? valid.reduce((home, b) => home + b, 0) / valid.length : null;
};

export const useInterferenceLocal = () => {
    const [entries, setEntries] = useState<CheckinEntry[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<WeekWindow>("this_week");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const MOCK_USER_ID = 1;

    const fetchEntries = useCallback(async () => {
        setIsLoading(true);
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                const mappedEntries: CheckinEntry[] = (parsedData || []).map((d: any) => ({
                    id: d.id,
                    workStudy: d.workStudy,
                    relationships: d.relationships,
                    sleepRoutine: d.sleepRoutine,
                    selfCare: d.selfCare,
                    createdAt: new Date(d.createdAt),
                }));
                setEntries(mappedEntries);
            } else {
                setEntries([]);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load interference data");
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
        const weekEntries = entries.filter((e) => e.createdAt >= start && e.createdAt <= end);
        if (weekEntries.length === 0) return null;
        return {
            workStudy: avg(weekEntries.map((e) => e.workStudy)),
            relationships: avg(weekEntries.map((e) => e.relationships)),
            sleepRoutine: avg(weekEntries.map((e) => e.sleepRoutine)),
            selfCare: avg(weekEntries.map((e) => e.selfCare)),
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
        const overall = values.reduce((home, b) => home + b, 0) / values.length;
        if (overall <= 3) return "OCD had minimal impact this week. Keep it up!";
        if (overall <= 6) return "OCD had some impact this week. You're doing okay.";
        return "OCD had a significant impact this week. Consider speaking to your therapist.";
    }, [weeklyAverages]);

    const submitCheckin = useCallback(
        async (data: { workStudy: number | null; relationships: number | null; sleepRoutine: number | null; selfCare: number | null }) => {
            setIsSubmitting(true);
            try {
                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 500));

                const newEntry: CheckinEntry = {
                    id: crypto.randomUUID(),
                    workStudy: data.workStudy,
                    relationships: data.relationships,
                    sleepRoutine: data.sleepRoutine,
                    selfCare: data.selfCare,
                    createdAt: new Date(),
                };

                const updatedEntries = [newEntry, ...entries];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
                setEntries(updatedEntries);

                toast.success("Check-in saved locally");
                return true;
            } catch (err) {
                console.error("Submit error:", err);
                toast.error("Failed to save check-in");
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [entries]
    );

    const refetchWeekly = useCallback(() => {
        fetchEntries();
    }, [fetchEntries]);

    return {
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
