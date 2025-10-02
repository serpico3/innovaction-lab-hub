import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Materiali from "./pages/Materiali";
import Scanner from "./pages/Scanner";
import Attivita from "./pages/Attivita";
import Formatori from "./pages/Formatori";
import Scuole from "./pages/Scuole";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/materiali" element={<Materiali />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/attivita" element={<Attivita />} />
          <Route path="/formatori" element={<Formatori />} />
          <Route path="/scuole" element={<Scuole />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
