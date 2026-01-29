import React from "react";
import { Home, Users, UserCircle, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = "home" | "community" | "therapist" | "profile";

interface BottomNavBarProps {
  activeTab: NavItem;
  onTabChange: (tab: NavItem) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: NavItem; icon: React.ReactNode; label: string }[] = [
    { id: "home", icon: <Home className="w-5 h-5" />, label: "Home" },
    { id: "community", icon: <Users className="w-5 h-5" />, label: "Community" },
    { id: "therapist", icon: <Stethoscope className="w-5 h-5" />, label: "Therapist" },
    { id: "profile", icon: <UserCircle className="w-5 h-5" />, label: "Profile" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-primary via-secondary to-accent pb-6 pt-3 px-4 rounded-t-2xl">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200",
              activeTab === item.id 
                ? "text-white scale-110" 
                : "text-white/70 hover:text-white/90"
            )}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;
