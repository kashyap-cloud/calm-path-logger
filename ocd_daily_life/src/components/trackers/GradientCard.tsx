import React from "react";
import { cn } from "@/lib/utils";

interface GradientCardProps {
  children: React.ReactNode;
  gradientClass?: string;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const GradientCard: React.FC<GradientCardProps> = ({
  children,
  gradientClass,
  className,
  onClick,
  isSelected = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl p-4 overflow-hidden transition-all duration-300",
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        gradientClass ? gradientClass : "glass-card",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GradientCard;
