import React from "react";
import { Stethoscope, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScreenTransition from "@/components/trackers/ScreenTransition";

const TherapistPlaceholder: React.FC = () => {
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-hero pt-12 pb-8 px-5 rounded-b-[2rem]">
        <ScreenTransition>
          <div className="text-center text-white">
            <h1 className="text-xl font-bold mb-1">Therapist</h1>
            <p className="text-white/80 text-xs">Connect with ERP specialists</p>
          </div>
        </ScreenTransition>
      </div>

      <div className="px-5 py-8">
        <ScreenTransition delay={100}>
          <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
            <div className="w-16 h-16 rounded-full gradient-teal flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              ERP Therapy Support
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Work with certified therapists who specialize in Exposure and Response Prevention therapy.
            </p>
            
            <div className="space-y-3">
              <Button className="w-full gradient-purple text-white rounded-xl">
                <Calendar className="w-4 h-4 mr-2" />
                Book a Session
              </Button>
              <Button variant="outline" className="w-full rounded-xl">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message Therapist
              </Button>
            </div>
          </div>
        </ScreenTransition>

        <ScreenTransition delay={200}>
          <div className="mt-6 bg-primary/5 rounded-xl p-4">
            <p className="text-xs text-muted-foreground text-center">
              💜 All therapists are licensed and trained in evidence-based OCD treatment
            </p>
          </div>
        </ScreenTransition>
      </div>
    </div>
  );
};

export default TherapistPlaceholder;
