
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import DrivePage from "./pages/DrivePage";
import TestsPage from "./pages/TestsPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import {TutorAi} from "./pages/TutorAi";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/drive" element={<DrivePage />} />
            <Route path="/tests" element={<TestsPage />} />
              <Route path="/tutor-ai" element={<TutorAi />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AuthProvider>
);

export default App;
