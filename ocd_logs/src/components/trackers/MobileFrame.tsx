import React from "react";

interface MobileFrameProps {
  children: React.ReactNode;
  showNotch?: boolean;
}

const MobileFrame: React.FC<MobileFrameProps> = ({ children, showNotch = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex items-start justify-center py-4">
      <div className="mobile-frame rounded-[2.5rem] border-[8px] border-slate-800 relative overflow-hidden shadow-2xl">
        {/* Phone notch */}
        {showNotch && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50" />
        )}
        
        {/* Content */}
        <div className="h-full min-h-screen overflow-y-auto custom-scrollbar bg-background">
          {children}
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full" />
      </div>
    </div>
  );
};

export default MobileFrame;
