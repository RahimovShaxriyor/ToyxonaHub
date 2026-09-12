import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import OwnerLayout from '../components/layout/OwnerLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { PageSkeleton } from '../components/ui/Skeleton';

// Public Pages (Core)
import HomePage from '../pages/public/HomePage';
import CatalogPage from '../pages/public/CatalogPage';
import HallDetailPage from '../pages/public/HallDetailPage';

// Lazy-loaded Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const OtpVerificationPage = lazy(() => import('../pages/auth/OtpVerificationPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));

// User Pages
const MyBookingsPage = lazy(() => import('../pages/user/MyBookingsPage'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));

// Owner Pages
const OwnerDashboardPage = lazy(() => import('../pages/owner/OwnerDashboardPage'));
const OwnerHallsPage = lazy(() => import('../pages/owner/OwnerHallsPage'));
const OwnerHallFormPage = lazy(() => import('../pages/owner/OwnerHallFormPage'));
const OwnerImagesPage = lazy(() => import('../pages/owner/OwnerImagesPage'));
const OwnerServicesPage = lazy(() => import('../pages/owner/OwnerServicesPage'));
const OwnerBookingsPage = lazy(() => import('../pages/owner/OwnerBookingsPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminApprovalsPage = lazy(() => import('../pages/admin/AdminApprovalsPage'));
const AdminHallsPage = lazy(() => import('../pages/admin/AdminHallsPage'));
const AdminOwnersPage = lazy(() => import('../pages/admin/AdminOwnersPage'));
const AdminBookingsPage = lazy(() => import('../pages/admin/AdminBookingsPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Public & Customer Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/halls" element={<Navigate to="/catalog" replace />} />
          <Route path="/halls/:id" element={<HallDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} />

          {/* User Protected Routes */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['USER']}>
                  <MyBookingsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Owner Workspace Routes */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['OWNER']}>
                <OwnerLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboardPage />} />
          <Route path="halls" element={<OwnerHallsPage />} />
          <Route path="halls/new" element={<OwnerHallFormPage />} />
          <Route path="halls/:id/edit" element={<OwnerHallFormPage />} />
          <Route path="halls/:id/images" element={<OwnerImagesPage />} />
          <Route path="halls/:id/services" element={<OwnerServicesPage />} />
          <Route path="bookings" element={<OwnerBookingsPage />} />
        </Route>

        {/* Admin Workspace Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="approvals" element={<AdminApprovalsPage />} />
          <Route path="halls" element={<AdminHallsPage />} />
          <Route path="owners" element={<AdminOwnersPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
