import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleRoute from './components/guards/RoleRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import ReportIssuePage from './pages/user/ReportIssuePage';
import MyIssuesPage from './pages/user/MyIssuesPage';
import IssueDetailsPage from './pages/issues/IssueDetailsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssuesPage from './pages/admin/AdminIssuesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffAssignedIssuesPage from './pages/staff/StaffAssignedIssuesPage';

// Common Pages
import ProfilePage from './pages/common/ProfilePage';
import NotificationsPage from './pages/common/NotificationsPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected General / Citizen Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['user', 'admin', 'staff']}>
                  <UserDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-issue"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['user', 'admin', 'staff']}>
                  <ReportIssuePage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-issues"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['user', 'admin', 'staff']}>
                  <MyIssuesPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id"
            element={
              <ProtectedRoute>
                <IssueDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/issues"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminIssuesPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/issues/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <IssueDetailsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminUsersPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminAnalyticsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Staff Protected Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['staff', 'admin']}>
                  <StaffDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/issues"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['staff', 'admin']}>
                  <StaffAssignedIssuesPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/issues/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['staff', 'admin']}>
                  <IssueDetailsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Common Authenticated Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
