import React from "react";
import { cn } from "@/lib/utils";

interface TrackerButtonProps {
  icon: React.ReactNode;
  label: string;
  gradientClass: string;
  onClick: () => void;
  isActive?: boolean;
}

const TrackerButton: React.FC<TrackerButtonProps> = ({
  icon,
  label,
  gradientClass,
  onClick,
  isActive = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 group",
        "animate-fade-slide-up"
      )}
    >
      <div
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center",
          "tracker-button shadow-lg",
          "ring-4 ring-white/50",
          gradientClass,
          isActive && "ring-primary ring-offset-2 ring-offset-background scale-105"
        )}
      >
        <span className="text-white text-2xl drop-shadow-sm">
          {icon}
        </span>
      </div>
      <span className="text-xs font-medium text-foreground/80 text-center max-w-[80px] leading-tight">
        {label}
      </span>
    </button>
  );
};

export default TrackerButton;
