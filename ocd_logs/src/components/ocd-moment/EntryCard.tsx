import React from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { OCDMomentEntry } from "@/hooks/useOCDMomentDB";
import { LOCATION_CONFIG, Location } from "@/hooks/useTrackerData";
import { format, isToday, isYesterday, parseISO } from "date-fns";

interface EntryCardProps {
  entry: OCDMomentEntry;
  selectedLocation: Location;
  onSelect?: (urge: string) => void;
  onDelete?: (entryId: string) => void;
  showDeleteButton?: boolean;
  animationDelay?: number;
}

// Get response badge color based on type
const getResponseBadgeClass = (responseType: string) => {
  switch (responseType) {
    case "acted":
      return "bg-pink-100 text-pink-700 border-pink-200";
    case "waited":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "noticed_without_acting":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

// Format date in a friendly way
const formatEntryDate = (dateString: string, t: any): string => {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return `${t('date.today')}, ${format(date, "h:mm a")} `;
  }

  if (isYesterday(date)) {
    return `${t('date.yesterday')}, ${format(date, "h:mm a")} `;
  }

  return format(date, "d MMM yyyy, h:mm a");
};

// Get location display text (handles custom_location for "Other")
const getLocationDisplay = (entry: OCDMomentEntry): string => {
  if (entry.location === "Other" && entry.custom_location) {
    return `Other • ${entry.custom_location} `;
  }
  return entry.location;
};

const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  selectedLocation,
  onSelect,
  onDelete,
  showDeleteButton = false,
  animationDelay = 0,
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(entry.urge);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  const { t } = useTranslation();

  return (
    <div
      onClick={handleClick}
      className={`bg - white rounded - 2xl p - 4 shadow - soft hover: shadow - md transition - all ${onSelect ? "cursor-pointer" : ""} `}
    >
      <div
        className="animate-fade-slide-up"
        style={{ animationDelay: `${animationDelay} ms` }}
      >
        {/* Header: Location emoji + urge + delete button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">
                {LOCATION_CONFIG[selectedLocation].emoji}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground line-clamp-2">
                {entry.urge}
              </span>
            </div>
          </div>

          {showDeleteButton && onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors flex-shrink-0"
              aria-label="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Footer: Date, location context, response badge */}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {formatEntryDate(entry.created_at, t)}
            </span>
            {selectedLocation === "other" && entry.custom_location && (
              <span className="text-xs text-primary font-medium">
                {entry.custom_location}
              </span>
            )}
          </div>

          <Badge
            variant="outline"
            className={`text - xs capitalize flex - shrink - 0 ${getResponseBadgeClass(entry.response_type)} `}
          >
            {t(`responses.${entry.response_type === 'noticed_without_acting' ? 'noticed' : entry.response_type} `)}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;