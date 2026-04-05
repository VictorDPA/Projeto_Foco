import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import StudyBlocks from "./pages/StudyBlocks";
import ErrorLog from "./pages/ErrorLog";
import LawMapping from "./pages/LawMapping";
import Materials from "./pages/Materials";
import MeuDia from "./pages/MeuDia";
import AgendaCiclo from "./pages/AgendaCiclo";
import Settings from "./pages/Settings";
import Manual from "./pages/Manual";
import LinksFavoritos from "./pages/LinksFavoritos";
import NotFound from "./pages/NotFound";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/study-blocks" element={<ProtectedRoute><StudyBlocks /></ProtectedRoute>} />
            <Route path="/links-favoritos" element={<ProtectedRoute><LinksFavoritos /></ProtectedRoute>} />
            <Route path="/error-log" element={<ProtectedRoute><ErrorLog /></ProtectedRoute>} />
            <Route path="/law-mapping" element={<ProtectedRoute><LawMapping /></ProtectedRoute>} />
            <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
            <Route path="/meu-dia" element={<ProtectedRoute><MeuDia /></ProtectedRoute>} />
            <Route path="/agenda-ciclo" element={<ProtectedRoute><AgendaCiclo /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/manual" element={<ProtectedRoute><Manual /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
