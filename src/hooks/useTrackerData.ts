import { useState, useCallback } from "react";

// Types
export type Location = "home" | "work" | "social" | "other";
export type ResponseType = "acted" | "delayed" | "resisted";

export interface OCDEntry {
  id: string;
  location: Location;
  compulsion: string;
  response: ResponseType;
  timestamp: Date;
  week: number;
}

export interface InterferenceEntry {
  id: string;
  workStudy: number;
  relationships: number;
  sleepRoutine: number;
  selfCare: number;
  timestamp: Date;
  week: number;
}

// Predefined compulsions
export const PREDEFINED_COMPULSIONS: Record<Location, string[]> = {
  home: ["Washing hands", "Checking locks", "Cleaning surfaces", "Organizing items", "Checking appliances"],
  work: ["Email checking", "Task verification", "Document review", "Workspace arrangement", "Deadline anxiety"],
  social: ["Conversation replay", "Social media checking", "Appearance checking", "Message rereading", "Reassurance seeking"],
  other: ["General checking", "Counting", "Mental rituals", "Avoidance", "Ordering/symmetry"],
};

// Location labels with icons
export const LOCATION_CONFIG: Record<Location, { label: string; emoji: string }> = {
  home: { label: "At Home", emoji: "🏠" },
  work: { label: "At Work", emoji: "💼" },
  social: { label: "Social", emoji: "👥" },
  other: { label: "Other", emoji: "📍" },
};

// Response config - neutral icons (circle variants) to avoid implying right/wrong
export const RESPONSE_CONFIG: Record<ResponseType, { label: string; emoji: string; color: string }> = {
  acted: { label: "I noticed myself acting on the urge", emoji: "●", color: "bg-response-acted" },
  delayed: { label: "I noticed myself waiting", emoji: "◐", color: "bg-response-delayed" },
  resisted: { label: "I noticed the urge without acting", emoji: "○", color: "bg-response-resisted" },
};

// Get current week number
const getWeekNumber = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
};

// Generate mock data for demo
const generateMockOCDData = (): OCDEntry[] => {
  const entries: OCDEntry[] = [];
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  
  // This week entries
  entries.push(
    { id: "1", location: "home", compulsion: "Washing hands", response: "acted", timestamp: new Date(), week: currentWeek },
    { id: "2", location: "home", compulsion: "Checking locks", response: "delayed", timestamp: new Date(), week: currentWeek },
    { id: "3", location: "work", compulsion: "Email checking", response: "resisted", timestamp: new Date(), week: currentWeek },
    { id: "4", location: "social", compulsion: "Conversation replay", response: "acted", timestamp: new Date(), week: currentWeek },
    { id: "13", location: "other", compulsion: "Counting steps", response: "delayed", timestamp: new Date(), week: currentWeek },
    { id: "14", location: "other", compulsion: "Mental rituals", response: "acted", timestamp: new Date(), week: currentWeek },
  );
  
  // Last week entries
  const lastWeek = currentWeek - 1;
  entries.push(
    { id: "5", location: "home", compulsion: "Washing hands", response: "acted", timestamp: new Date(), week: lastWeek },
    { id: "6", location: "home", compulsion: "Checking locks", response: "acted", timestamp: new Date(), week: lastWeek },
    { id: "7", location: "work", compulsion: "Task verification", response: "delayed", timestamp: new Date(), week: lastWeek },
    { id: "8", location: "social", compulsion: "Reassurance seeking", response: "resisted", timestamp: new Date(), week: lastWeek },
    { id: "9", location: "home", compulsion: "Cleaning surfaces", response: "delayed", timestamp: new Date(), week: lastWeek },
  );
  
  // Two weeks ago
  const twoWeeksAgo = currentWeek - 2;
  entries.push(
    { id: "10", location: "home", compulsion: "Washing hands", response: "acted", timestamp: new Date(), week: twoWeeksAgo },
    { id: "11", location: "work", compulsion: "Document review", response: "acted", timestamp: new Date(), week: twoWeeksAgo },
    { id: "12", location: "home", compulsion: "Checking appliances", response: "acted", timestamp: new Date(), week: twoWeeksAgo },
  );
  
  return entries;
};

const generateMockInterferenceData = (): InterferenceEntry[] => {
  const entries: InterferenceEntry[] = [];
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  
  // Current week - multiple entries, system keeps peak
  entries.push(
    { id: "i1", workStudy: 6, relationships: 4, sleepRoutine: 7, selfCare: 5, timestamp: new Date(), week: currentWeek },
  );
  
  // Last week
  entries.push(
    { id: "i2", workStudy: 5, relationships: 6, sleepRoutine: 4, selfCare: 4, timestamp: new Date(), week: currentWeek - 1 },
  );
  
  // Two weeks ago
  entries.push(
    { id: "i3", workStudy: 7, relationships: 5, sleepRoutine: 6, selfCare: 6, timestamp: new Date(), week: currentWeek - 2 },
  );
  
  return entries;
};

export const useTrackerData = () => {
  const [ocdEntries, setOcdEntries] = useState<OCDEntry[]>(generateMockOCDData);
  const [interferenceEntries, setInterferenceEntries] = useState<InterferenceEntry[]>(generateMockInterferenceData);
  
  const currentWeek = getWeekNumber(new Date());
  
  // Add new OCD entry
  const addOCDEntry = useCallback((location: Location, compulsion: string, response: ResponseType) => {
    const newEntry: OCDEntry = {
      id: `ocd-${Date.now()}`,
      location,
      compulsion,
      response,
      timestamp: new Date(),
      week: currentWeek,
    };
    setOcdEntries(prev => [...prev, newEntry]);
  }, [currentWeek]);
  
  // Add interference entry
  const addInterferenceEntry = useCallback((workStudy: number, relationships: number, sleepRoutine: number, selfCare: number) => {
    const newEntry: InterferenceEntry = {
      id: `int-${Date.now()}`,
      workStudy,
      relationships,
      sleepRoutine,
      selfCare,
      timestamp: new Date(),
      week: currentWeek,
    };
    setInterferenceEntries(prev => [...prev, newEntry]);
  }, [currentWeek]);
  
  // Get entries by location
  const getEntriesByLocation = useCallback((location: Location) => {
    return ocdEntries.filter(entry => entry.location === location);
  }, [ocdEntries]);
  
  // Get unique compulsions by location
  const getCompulsionsByLocation = useCallback((location: Location): string[] => {
    const entries = getEntriesByLocation(location);
    const uniqueCompulsions = new Set(entries.map(e => e.compulsion));
    return Array.from(uniqueCompulsions);
  }, [getEntriesByLocation]);
  
  // Get entries by week
  const getEntriesByWeek = useCallback((week: number) => {
    return ocdEntries.filter(entry => entry.week === week);
  }, [ocdEntries]);
  
  // Get interference by week (peak values)
  const getInterferenceByWeek = useCallback((week: number): InterferenceEntry | null => {
    const weekEntries = interferenceEntries.filter(e => e.week === week);
    if (weekEntries.length === 0) return null;
    
    // Return peak values for each domain
    return weekEntries.reduce((peak, current) => ({
      id: peak.id,
      workStudy: Math.max(peak.workStudy, current.workStudy),
      relationships: Math.max(peak.relationships, current.relationships),
      sleepRoutine: Math.max(peak.sleepRoutine, current.sleepRoutine),
      selfCare: Math.max(peak.selfCare, current.selfCare),
      timestamp: peak.timestamp,
      week: peak.week,
    }));
  }, [interferenceEntries]);
  
  // Get weekly insight for OCD entries
  const getWeeklyInsight = useCallback((week: number): { 
    summary: string; 
    dominantPattern: string;
    actedPercent: number;
    delayedPercent: number;
    resistedPercent: number;
    allActed: boolean;
  } | null => {
    const entries = getEntriesByWeek(week);
    if (entries.length === 0) return null;
    
    const acted = entries.filter(e => e.response === "acted").length;
    const delayed = entries.filter(e => e.response === "delayed").length;
    const resisted = entries.filter(e => e.response === "resisted").length;
    const total = entries.length;
    
    const actedPercent = Math.round((acted / total) * 100);
    const delayedPercent = Math.round((delayed / total) * 100);
    const resistedPercent = Math.round((resisted / total) * 100);
    const allActed = acted === total;
    
    let dominantPattern = "mixed";
    let summary = "";
    
    if (acted > delayed && acted > resisted) {
      dominantPattern = "act-dominated";
      summary = "Your responses were mostly immediate reactions this week.";
    } else if (delayed > acted && delayed > resisted) {
      dominantPattern = "delay-dominated";
      summary = "You showed moments of pause before responding this week.";
    } else if (resisted > acted && resisted > delayed) {
      dominantPattern = "resist-dominated";
      summary = "You didn't respond to every urge the same way.";
    } else {
      dominantPattern = "mixed";
      summary = "You showed a mix of responses this week.";
    }
    
    return { summary, dominantPattern, actedPercent, delayedPercent, resistedPercent, allActed };
  }, [getEntriesByWeek]);
  
  // Get available weeks for selection
  const getAvailableWeeks = useCallback((): number[] => {
    const weeks = new Set(ocdEntries.map(e => e.week));
    return Array.from(weeks).sort((a, b) => b - a);
  }, [ocdEntries]);
  
  return {
    ocdEntries,
    interferenceEntries,
    currentWeek,
    addOCDEntry,
    addInterferenceEntry,
    getEntriesByLocation,
    getCompulsionsByLocation,
    getEntriesByWeek,
    getInterferenceByWeek,
    getWeeklyInsight,
    getAvailableWeeks,
  };
};

export default useTrackerData;
