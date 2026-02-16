import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TokenAuthContextType {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => void;
}

const TokenAuthContext = createContext<TokenAuthContextType | undefined>(undefined);

const TOKEN_REDIRECT_URL = "/token";
const USER_INFO_API = "https://api.mantracare.com/user/user-info";
const SESSION_KEY = "ocd_trackers_user_id";

// TEMPORARY: Set to false once backend tokens are live
const DEMO_MODE = false;
const DEMO_USER_ID = "12345"; // BIGINT-like string

export const TokenAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hardRedirect = useCallback(() => {
    window.location.href = TOKEN_REDIRECT_URL;
  }, []);

  const cleanUrl = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, document.title, url.toString());
  }, []);

  const validateToken = useCallback(async (token: string): Promise<string | null> => {
    try {
      const response = await fetch(USER_INFO_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        console.error("Token validation failed:", response.status);
        return null;
      }

      const data = await response.json();
      // data.user_id might be a number or string representation of BIGINT
      return data.user_id ? String(data.user_id) : null;
    } catch (error) {
      console.error("Token validation error:", error);
      return null;
    }
  }, []);

  const ensureUserExists = useCallback(async (id: string) => {
    try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        console.error("Invalid numeric ID for users table:", id);
        return;
      }

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", numericId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking user existence:", fetchError);
        return;
      }

      // If user doesn't exist, create them
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from("users")
          .insert({ id: numericId });

        if (insertError) {
          console.error("Error creating user:", insertError);
        }
      }
    } catch (error) {
      console.error("Error ensuring user exists:", error);
    }
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUserId(null);
    hardRedirect();
  }, [hardRedirect]);

  useEffect(() => {
    const initAuth = async () => {
      // In Demo Mode, use a test BIGINT-like ID
      if (DEMO_MODE) {
        const storedUserId = sessionStorage.getItem(SESSION_KEY) || DEMO_USER_ID;
        sessionStorage.setItem(SESSION_KEY, storedUserId);
        await ensureUserExists(storedUserId);
        setUserId(storedUserId);
        setIsLoading(false);
        return;
      }

      // Check for existing session in sessionStorage only
      const storedUserId = sessionStorage.getItem(SESSION_KEY);

      if (storedUserId) {
        setUserId(storedUserId);
        setIsLoading(false);
        return;
      }

      // Check URL for token
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        hardRedirect();
        return;
      }

      const validatedUserId = await validateToken(token);

      if (!validatedUserId) {
        hardRedirect();
        return;
      }

      // Store in sessionStorage and clean URL
      sessionStorage.setItem(SESSION_KEY, validatedUserId);
      setUserId(validatedUserId);
      cleanUrl();

      // Ensure user record exists in Supabase
      await ensureUserExists(validatedUserId);

      setIsLoading(false);
    };

    initAuth();
  }, [validateToken, hardRedirect, cleanUrl, ensureUserExists]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Secure Handshake...</h2>
        <p className="text-muted-foreground text-sm mt-2">Connecting to your OCD Trackers session</p>
      </div>
    );
  }

  return (
    <TokenAuthContext.Provider value={{ userId, isAuthenticated: !!userId, isLoading, signOut }}>
      {children}
    </TokenAuthContext.Provider>
  );
};

export const useTokenAuth = () => {
  const context = useContext(TokenAuthContext);
  if (context === undefined) {
    throw new Error("useTokenAuth must be used within a TokenAuthProvider");
  }
  return context;
};