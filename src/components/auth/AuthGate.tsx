 import React from "react";
 import { useTokenAuth } from "@/contexts/TokenAuthContext";
 import { Loader2 } from "lucide-react";
 
 interface AuthGateProps {
   children: React.ReactNode;
 }
 
 const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
   const { isLoading, isAuthenticated } = useTokenAuth();
 
   // Block all UI until auth is complete
   if (isLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
           <p className="text-sm text-muted-foreground">Authenticating...</p>
         </div>
       </div>
     );
   }
 
   // If not authenticated after loading, the redirect will have happened
   // This is a safety fallback
   if (!isAuthenticated) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
           <p className="text-sm text-muted-foreground">Redirecting...</p>
         </div>
       </div>
     );
   }
 
   return <>{children}</>;
 };
 
 export default AuthGate;