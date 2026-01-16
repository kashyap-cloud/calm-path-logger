import React from "react";
import { cn } from "@/lib/utils";

interface ScreenTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  className,
  delay = 0,
}) => {
  return (
    <div
      className={cn("animate-fade-slide-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default ScreenTransition;
