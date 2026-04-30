import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Pages
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageEmployees from './pages/admin/ManageEmployees';
import ManageCabs from './pages/admin/ManageCabs';
import ViewRequests from './pages/admin/ViewRequests';
import OptimizationPage from './pages/admin/OptimizationPage';
import RoutesMap from './pages/admin/RoutesMap';
import Analytics from './pages/admin/Analytics';
import FleetMap from './pages/admin/FleetMap';

import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import RequestCab from './pages/employee/RequestCab';
import MyRides from './pages/employee/MyRides';
import Notifications from './pages/employee/Notifications';
import Profile from './pages/employee/Profile';
import LiveTracking from './pages/employee/LiveTracking';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="employees" element={<ManageEmployees />} />
            <Route path="cabs" element={<ManageCabs />} />
            <Route path="requests" element={<ViewRequests />} />
            <Route path="optimize" element={<OptimizationPage />} />
            <Route path="routes" element={<RoutesMap />} />
            <Route path="fleet" element={<FleetMap />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee" element={<ProtectedRoute role="EMPLOYEE"><EmployeeLayout /></ProtectedRoute>}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="request" element={<RequestCab />} />
            <Route path="rides" element={<MyRides />} />
            <Route path="track" element={<LiveTracking />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
