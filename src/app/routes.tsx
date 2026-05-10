import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import SellTransactionPage from './pages/SellTransactionPage';
import PickupPage from './pages/PickupPage';
import HistoryPage from './pages/HistoryPage';
import PointsPage from './pages/PointsPage';
import RewardsPage from './pages/RewardsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SchedulesPage from './pages/admin/SchedulesPage';
import WasteTypesPage from './pages/admin/WasteTypesPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import AdminRewardsPage from './pages/admin/AdminRewardsPage';
import AdminRedemptionsPage from './pages/admin/AdminRedemptionsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiredRole="nasabah">
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sell',
    element: (
      <ProtectedRoute requiredRole="nasabah">
        <SellTransactionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pickup',
    element: (
      <ProtectedRoute requiredRole="nasabah">
        <PickupPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/history',
    element: (
      <ProtectedRoute requiredRole="nasabah">
        <HistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute requiredRole="nasabah">
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/points',
    element: (
      <ProtectedRoute requiredRole="nasabah">
        <PointsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/rewards',
    element: (
      <ProtectedRoute requiredRole="nasabah">
        <RewardsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/schedules',
    element: (
      <ProtectedRoute requiredRole="admin">
        <SchedulesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/waste-types',
    element: (
      <ProtectedRoute requiredRole="admin">
        <WasteTypesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/transactions',
    element: (
      <ProtectedRoute requiredRole="admin">
        <TransactionsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/rewards',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminRewardsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/redemptions',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminRedemptionsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
