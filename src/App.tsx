import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { TokenAuthProvider } from "@/contexts/TokenAuthContext";
 import AuthGate from "@/components/auth/AuthGate";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
 import TokenRedirect from "./pages/TokenRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
     <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
         <Routes>
           {/* Token redirect page - accessible without auth */}
           <Route path="/token" element={<TokenRedirect />} />
           
           {/* All other routes require token auth */}
           <Route
             path="/*"
             element={
               <TokenAuthProvider>
                 <AuthGate>
                   <Routes>
                     <Route path="/" element={<Index />} />
                     <Route path="*" element={<NotFound />} />
                   </Routes>
                 </AuthGate>
               </TokenAuthProvider>
             }
           />
         </Routes>
      </TooltipProvider>
     </BrowserRouter>
  </QueryClientProvider>
);

export default App;
