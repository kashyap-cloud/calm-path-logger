import React from "react";
import { Home, Users, UserCircle, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = "home" | "community" | "therapist" | "profile";

interface BottomNavBarProps {
  activeTab: NavItem;
  onTabChange: (tab: NavItem) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: NavItem; icon: React.ReactNode; label: string; clickable: boolean }[] = [
    { id: "home", icon: <Home className="w-5 h-5" />, label: "Home", clickable: false },
    { id: "community", icon: <Users className="w-5 h-5" />, label: "Community", clickable: true },
    { id: "therapist", icon: <Stethoscope className="w-5 h-5" />, label: "Therapist", clickable: false },
    { id: "profile", icon: <UserCircle className="w-5 h-5" />, label: "Profile", clickable: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border pb-safe pt-3 px-4 z-50">
      <div className="max-w-3xl mx-auto flex justify-around items-center pb-4">
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={item.clickable ? () => onTabChange(item.id) : undefined}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200 p-2",
              item.clickable && "cursor-pointer",
              activeTab === item.id 
                ? "text-primary scale-105" 
                : "text-muted-foreground",
              item.clickable && activeTab !== item.id && "hover:text-primary/70"
            )}
          >
            {item.icon}
            <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;
