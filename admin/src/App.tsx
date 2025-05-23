import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DrivePage from "./pages/DrivePage";
// import TestsPage from "./pages/TestsPage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SignIn } from "./pages/SignIn";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignIn />
        }
      />
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? <DrivePage /> : <Navigate to="/" replace />
        }
      />
      {/* <Route path="/tests" element={<TestsPage />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
