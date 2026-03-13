import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { DashboardClientsPage } from "../pages/DashboardClientsPage";
import { ClientDetailsPage } from "../pages/ClientDetailsPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProjectDetailsPage } from "../pages/ProjectDetailsPage";
import { InvoicesPage } from "../pages/InvoicesPage";
import { SubscriptionPage } from "../pages/SubscriptionPage";
import { ClientPortalPage } from "../pages/ClientPortalPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { useAuth } from "../context/AuthContext";

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
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <DashboardClientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/:id"
          element={
            <ProtectedRoute>
              <ClientDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Public — no auth needed */}
      <Route path="/portal/:token" element={<ClientPortalPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

