import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { DashboardClientsPage } from "../pages/DashboardClientsPage";
import { ClientDetailsPage } from "../pages/ClientDetailsPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProjectDetailsPage } from "../pages/ProjectDetailsPage";
import { InvoicesPage } from "../pages/InvoicesPage";
import { SubscriptionPage } from "../pages/SubscriptionPage";
import { SettingsPage } from "../pages/SettingsPage";
import { LeadsPage } from "../pages/LeadsPage";
import { ClientPortalPage } from "../pages/ClientPortalPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { LandingPage } from "../pages/LandingPage";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../pages/AdminDashboard";

function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Landing Page - Root */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
        <Route
          path="/clients"
          element={<DashboardClientsPage />}
        />
        <Route
          path="/clients/:id"
          element={<ClientDetailsPage />}
        />
        <Route
          path="/projects"
          element={<ProjectsPage />}
        />
        <Route
          path="/projects/:id"
          element={<ProjectDetailsPage />}
        />
        <Route
          path="/invoices"
          element={<InvoicesPage />}
        />
        <Route
          path="/subscription"
          element={<SubscriptionPage />}
        />
        <Route
          path="/leads"
          element={<LeadsPage />}
        />
        <Route
          path="/settings"
          element={<SettingsPage />}
        />
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* Public — no auth needed */}
      <Route path="/portal/:token" element={<ClientPortalPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

