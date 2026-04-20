import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SelfAssessment from './pages/SelfAssessment';
import HRManagement from './pages/HRManagement';
import ManagerReviewPanel from './pages/ManagerReviewPanel';
import CommitteeReviewPanel from './pages/CommitteeReviewPanel';
import PromotionBoard from './pages/PromotionBoard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/self-assessment" 
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER']}>
              <Layout>
                <SelfAssessment />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/manager-reviews" 
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <Layout>
                <ManagerReviewPanel />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/committee-reviews" 
          element={
            <ProtectedRoute allowedRoles={['REVIEW_COMMITTEE', 'ADMIN']}>
              <Layout>
                <CommitteeReviewPanel />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/hr-management" 
          element={
            <ProtectedRoute allowedRoles={['HR_MANAGER', 'ADMIN']}>
              <Layout>
                <HRManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/promotions" 
          element={
            <ProtectedRoute allowedRoles={['HR_MANAGER', 'ADMIN', 'REVIEW_COMMITTEE']}>
              <Layout>
                <PromotionBoard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
