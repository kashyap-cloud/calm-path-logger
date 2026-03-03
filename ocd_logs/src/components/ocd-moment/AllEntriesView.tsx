import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Location, LOCATION_CONFIG } from "@/hooks/useTrackerData";
import useOCDMomentDB, { OCDMomentEntry } from "@/hooks/useOCDMomentDB";
import EntryCard from "./EntryCard";
import ScreenTransition from "../trackers/ScreenTransition";

interface AllEntriesViewProps {
  location: Location;
  entries: OCDMomentEntry[];
  isLoading: boolean;
  isDeleting: boolean;
  onBack: () => void;
  onDelete: (entryId: string) => void;
  onFetchAll: (location: string) => void;
}

const AllEntriesView: React.FC<AllEntriesViewProps> = ({
  location,
  entries,
  isLoading,
  isDeleting,
  onBack,
  onDelete,
  onFetchAll,
}) => {
  const { t } = useTranslation();
  useEffect(() => {
    onFetchAll(LOCATION_CONFIG[location].label);
  }, [location, onFetchAll]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-tracker-moment-light via-background to-background">
      {/* Header */}
      <div className="gradient-purple pt-10 pb-6 px-5 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            disabled={isDeleting}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">
            {t('history_view.title')} • {t(`locations.${location}`)}
          </h1>
        </div>
        <p className="text-white/80 text-sm">
          {entries.length} {entries.length === 1 ? t('history_view.entry') : t('history_view.entries')} {t('history_view.logged')}
        </p>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        <ScreenTransition>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">{t('history_view.loading')}</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">{LOCATION_CONFIG[location].emoji}</span>
              <p className="text-muted-foreground">{t('history_view.empty', { location: t(`locations.${location}`) })}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  selectedLocation={location}
                  onDelete={onDelete}
                  showDeleteButton={true}
                  animationDelay={index * 30}
                />
              ))}
            </div>
          )}
        </ScreenTransition>
      </div>
    </div>
  );
};

export default AllEntriesView;