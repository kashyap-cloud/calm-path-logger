import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Heart } from "lucide-react";
import MobileFrame from "@/components/trackers/MobileFrame";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEmailSent(true);
    toast({
      title: "Check your inbox",
      description: "We've sent you a magic link to sign in.",
    });
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="gradient-hero pt-16 pb-12 px-6 rounded-b-[2rem]">
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">OCD Trackers</h1>
            <p className="text-white/80 text-sm">
              A gentle space for awareness and reflection
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-10">
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Check your email
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                We've sent a sign-in link to <strong>{email}</strong>.
                Click the link to continue.
              </p>
              <p className="text-xs text-muted-foreground pt-4">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary underline underline-offset-2"
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Welcome
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Enter your email and we'll send you a link to sign in.
                  No password needed.
                </p>
              </div>

              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-center text-base rounded-xl border-muted"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full h-12 rounded-xl text-base font-medium gradient-purple border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Continue with Email"
                  )}
                </Button>
              </form>

              <p className="text-xs text-center text-muted-foreground pt-4 leading-relaxed">
                By continuing, you agree to use this app mindfully
                as a supportive tool, not a replacement for professional care.
              </p>
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
};

export default LoginScreen;
