 import React, { useEffect } from "react";
 import { Loader2 } from "lucide-react";
 
 const TokenRedirect: React.FC = () => {
   useEffect(() => {
     // This page is shown when auth fails
     // The webview controller should handle this route
     console.log("Token redirect page - awaiting valid token");
   }, []);
 
   return (
     <div className="min-h-screen flex items-center justify-center bg-background">
       <div className="flex flex-col items-center gap-4 text-center px-6">
         <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
         <div>
           <h1 className="text-lg font-semibold text-foreground mb-2">
             Session Required
           </h1>
           <p className="text-sm text-muted-foreground max-w-xs">
             Please access this app through the authorized channel.
           </p>
         </div>
       </div>
     </div>
   );
 };
 
 export default TokenRedirect;