import React from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center",
        "shadow-soft transition-all duration-200 hover:bg-white hover:shadow-md",
        "active:scale-95",
        className
      )}
    >
      <ArrowLeft className="w-5 h-5 text-foreground/70" />
    </button>
  );
};

export default BackButton;
