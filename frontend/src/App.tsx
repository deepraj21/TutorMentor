import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/layout/AppSidebar";
import RoleSelection from "./pages/RoleSelection";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import MaterialsLibrary from "./pages/MaterialsLibrary";
import MaterialsPage from "./pages/MaterialsPage";
import MaterialDetail from "./pages/MaterialDetail";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/middleware/ProtectedRoute";
import NotFound from "./pages/NotFound";
import TutorAi from "./pages/TutorAi";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner richColors />
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<RoleSelection />} />
              <Route path="/login/teacher" element={<TeacherLogin />} />
              <Route path="/login/student" element={<StudentLogin />} />

              <Route path="/*" element={
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <div className="flex-1">
                      <Routes>
                        <Route path="teacher" element={
                          <ProtectedRoute>
                            <TeacherDashboard />
                          </ProtectedRoute>
                        } />

                        <Route path="student" element={
                          <ProtectedRoute>
                            <StudentDashboard />
                          </ProtectedRoute>
                        } />

                        <Route path="materials-library" element={
                          <ProtectedRoute>
                            <MaterialsLibrary />
                          </ProtectedRoute>
                        } />

                        <Route path="materials/:classId" element={
                          <ProtectedRoute>
                            <MaterialsPage />
                          </ProtectedRoute>
                        } />

                        <Route path="materials/:classId/:materialId" element={
                          <ProtectedRoute>
                            <MaterialDetail />
                          </ProtectedRoute>
                        } />

                        <Route path="profile" element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } />

                        <Route path="settings" element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        } />

                        <Route path="/tutor-ai" element={
                          <ProtectedRoute>
                            <TutorAi />
                          </ProtectedRoute>
                        } />

                      </Routes>
                    </div>
                  </div>
                </SidebarProvider>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
