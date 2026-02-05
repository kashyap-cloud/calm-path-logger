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
 const SESSION_KEY = "mantra_user_id";
 
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
       return data.user_id || null;
     } catch (error) {
       console.error("Token validation error:", error);
       return null;
     }
   }, []);
 
   const ensureUserExists = useCallback(async (id: string) => {
     try {
       // Check if user exists
       const { data: existingUser, error: fetchError } = await supabase
         .from("users")
         .select("id")
         .eq("id", id)
         .maybeSingle();
 
       if (fetchError) {
         console.error("Error checking user existence:", fetchError);
         return;
       }
 
       // If user doesn't exist, create them
       if (!existingUser) {
         const { error: insertError } = await supabase
           .from("users")
           .insert({ id });
 
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
       // Check for existing session first
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
         // No token and no session - redirect
         hardRedirect();
         return;
       }
 
       // Validate token with API
       const validatedUserId = await validateToken(token);
 
       if (!validatedUserId) {
         // Invalid token - redirect
         hardRedirect();
         return;
       }
 
       // Success: store in sessionStorage and clean URL
       sessionStorage.setItem(SESSION_KEY, validatedUserId);
       setUserId(validatedUserId);
       cleanUrl();
 
       // Ensure user exists in database
       await ensureUserExists(validatedUserId);
 
       setIsLoading(false);
     };
 
     initAuth();
   }, [validateToken, hardRedirect, cleanUrl, ensureUserExists]);
 
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