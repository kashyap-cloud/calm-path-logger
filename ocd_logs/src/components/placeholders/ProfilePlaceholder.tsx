import React from "react";
import { UserCircle, Settings, Bell, Shield, HelpCircle } from "lucide-react";
import ScreenTransition from "@/components/trackers/ScreenTransition";

const ProfilePlaceholder: React.FC = () => {
  const menuItems = [
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", badge: "3" },
    { icon: <Shield className="w-5 h-5" />, label: "Privacy & Safety" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help & Support" },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-hero pt-12 pb-8 px-5 rounded-b-[2rem]">
        <ScreenTransition>
          <div className="text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 ring-4 ring-white/30">
              <UserCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-lg font-bold">Anonymous User</h1>
            <p className="text-white/80 text-xs mt-1">Your privacy is protected</p>
          </div>
        </ScreenTransition>
      </div>

      <div className="px-5 py-6">
        {/* Stats */}
        <ScreenTransition delay={100}>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Days Active", value: "14" },
              { label: "Moments Logged", value: "47" },
              { label: "Current Streak", value: "5" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-3 text-center shadow-soft">
                <p className="text-lg font-bold text-primary">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScreenTransition>

        {/* Menu */}
        <ScreenTransition delay={200}>
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            {menuItems.map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScreenTransition>
      </div>
    </div>
  );
};

export default ProfilePlaceholder;
