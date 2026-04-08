import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

// HR Manager
import HRDashboard from "@/pages/hr/HRDashboard";
import EmployeesPage from "@/pages/hr/EmployeesPage";
import InterviewsPage from "@/pages/hr/InterviewsPage";
import OnboardingPage from "@/pages/hr/OnboardingPage";
import AttendancePage from "@/pages/hr/AttendancePage";
import PayrollPage from "@/pages/hr/PayrollPage";

// General Manager
import GMDashboard from "@/pages/gm/GMDashboard";
import GMLeavesPage from "@/pages/gm/GMLeavesPage";
import GMAttendanceReportPage from "@/pages/gm/GMAttendanceReportPage";
import GMPerformancePage from "@/pages/gm/GMPerformancePage";

// Project Manager
import PMDashboard from "@/pages/pm/PMDashboard";
import PMTeamPerformancePage from "@/pages/pm/PMTeamPerformancePage";
import PMSchedulesPage from "@/pages/pm/PMSchedulesPage";

// Employee
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import MyAttendancePage from "@/pages/employee/MyAttendancePage";
import MyLeavesPage from "@/pages/employee/MyLeavesPage";
import MyPayslipsPage from "@/pages/employee/MyPayslipsPage";
import MyPerformancePage from "@/pages/employee/MyPerformancePage";
import NotificationsPage from "@/pages/employee/NotificationsPage";

// Shared
import ProjectsPage from "@/pages/ProjectsPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const DashboardRouter = () => {
  const { role } = useAuth();
  if (role === 'hr_manager') return <HRDashboard />;
  if (role === 'gm') return <GMDashboard />;
  if (role === 'project_manager') return <PMDashboard />;
  return <EmployeeDashboard />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRouter />} />

        {/* Shared */}
        <Route path="/projects" element={<ProtectedRoute allowedRoles={['hr_manager', 'gm', 'project_manager', 'employee']}><ProjectsPage /></ProtectedRoute>} />

        {/* HR Manager */}
        <Route path="/employees" element={<ProtectedRoute allowedRoles={['hr_manager']}><EmployeesPage /></ProtectedRoute>} />
        <Route path="/interviews" element={<ProtectedRoute allowedRoles={['hr_manager']}><InterviewsPage /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute allowedRoles={['hr_manager']}><OnboardingPage /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute allowedRoles={['hr_manager']}><AttendancePage /></ProtectedRoute>} />
        <Route path="/payroll" element={<ProtectedRoute allowedRoles={['hr_manager']}><PayrollPage /></ProtectedRoute>} />

        {/* General Manager */}
        <Route path="/gm-leaves" element={<ProtectedRoute allowedRoles={['gm']}><GMLeavesPage /></ProtectedRoute>} />
        <Route path="/gm-attendance" element={<ProtectedRoute allowedRoles={['gm']}><GMAttendanceReportPage /></ProtectedRoute>} />
        <Route path="/gm-performance" element={<ProtectedRoute allowedRoles={['gm']}><GMPerformancePage /></ProtectedRoute>} />

        {/* Project Manager */}
        <Route path="/pm-performance" element={<ProtectedRoute allowedRoles={['project_manager']}><PMTeamPerformancePage /></ProtectedRoute>} />
        <Route path="/pm-schedules" element={<ProtectedRoute allowedRoles={['project_manager']}><PMSchedulesPage /></ProtectedRoute>} />

        {/* Employee */}
        <Route path="/my-attendance" element={<ProtectedRoute allowedRoles={['employee']}><MyAttendancePage /></ProtectedRoute>} />
        <Route path="/my-leaves" element={<ProtectedRoute allowedRoles={['employee']}><MyLeavesPage /></ProtectedRoute>} />
        <Route path="/my-payslips" element={<ProtectedRoute allowedRoles={['employee']}><MyPayslipsPage /></ProtectedRoute>} />
        <Route path="/my-performance" element={<ProtectedRoute allowedRoles={['employee']}><MyPerformancePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={['employee']}><NotificationsPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
