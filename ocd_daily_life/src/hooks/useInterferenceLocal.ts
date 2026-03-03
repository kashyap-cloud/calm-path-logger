import { useState, useCallback, useMemo } from "react";

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

const avg = (values: (number | null)[]): number | null => {
    const valid = values.filter((v): v is number => v !== null);
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
};

export const useInterferenceLocal = () => {
    const [entries, setEntries] = useState<CheckinEntry[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<WeekWindow>("this_week");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        const overall = values.reduce((a, b) => a + b, 0) / values.length;
        if (overall <= 3) return "OCD had minimal impact this week. Keep it up!";
        if (overall <= 6) return "OCD had some impact this week. You're doing okay.";
        return "OCD had a significant impact this week. Consider speaking to your therapist.";
    }, [weeklyAverages]);

    const submitCheckin = useCallback(
        async (data: { workStudy: number | null; relationships: number | null; sleepRoutine: number | null; selfCare: number | null }) => {
            setIsSubmitting(true);
            // Simulate a brief async delay
            await new Promise((r) => setTimeout(r, 500));
            const entry: CheckinEntry = {
                id: `entry-${Date.now()}`,
                ...data,
                createdAt: new Date(),
            };
            setEntries((prev) => [...prev, entry]);
            setIsSubmitting(false);
            return true;
        },
        []
    );

    const refetchWeekly = useCallback(() => {
        // No-op for local state — data is always fresh
    }, []);

    return {
        entries,
        submitCheckin,
        isSubmitting,
        weeklyAverages,
        weeklySummary,
        isLoadingWeekly: false,
        refetchWeekly,
        weekWindows: WEEK_WINDOWS,
        selectedWeek,
        setSelectedWeek,
    };
};
