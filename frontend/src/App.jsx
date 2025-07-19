import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

import MemberDashboard from './pages/MemberDashboard';
import PlanSelection from './pages/PlanSelection';
import MockPayment from './pages/MockPayment';
import VisitHistory from './pages/VisitHistory';
import Profile from './pages/Profile';

import GymDashboard from './pages/GymDashboard';
import Members from './pages/gym/Members';
import Schedule from './pages/gym/Schedule';

import AdminDashboard from './pages/AdminDashboard';
import CreateGym from './pages/admin/CreateGym';
import ManageGym from './pages/admin/ManageGym';
import EditGym from './pages/admin/EditGym';
import ManageMember from './pages/admin/ManageMember';

import MemberLayout from './layouts/MemberLayout';
import GymLayout from './layouts/GymLayout';
import AdminLayout from './layouts/AdminLayout';

const AppRoutes = () => {
  const { user, role } = useAuth();

  return (
    <Routes>
      <Route path='/' element={<Landing />} />
      <Route path='/login' element={user ? <Navigate to={`/${role}/dashboard`} /> : <Login />} />
      <Route path='/signup' element={user ? <Navigate to={`/${role}/dashboard`} /> : <Signup />} />

      <Route
        path='/member'
        element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to='dashboard' />} />
        <Route path='dashboard' element={<MemberDashboard />} />
        <Route path='plans' element={<PlanSelection />} />
        <Route path='payment' element={<MockPayment />} />
        <Route path='history' element={<VisitHistory />} />
        <Route path='profile' element={<Profile />} />
      </Route>

      <Route
        path='/gym'
        element={
          <ProtectedRoute allowedRoles={['gym']}>
            <GymLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to='dashboard' />} />
        <Route path='dashboard' element={<GymDashboard />} />
        <Route path='members' element={<Members />} />
        <Route path='schedule' element={<Schedule />} />
      </Route>

      <Route
        path='/admin'
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to='dashboard' />} />
        <Route path='dashboard' element={<AdminDashboard />} />
        <Route path='create-gym' element={<CreateGym />} />
        <Route path='manage-gym' element={<ManageGym />} />
        <Route path='edit-gym/:id' element={<EditGym />} />
        <Route path='member' element={<ManageMember />} />
        <Route path='analytics' element={<div>Analytics</div>} />
        <Route path='settings' element={<div>Settings</div>} />
      </Route>

      <Route
        path='/dashboard'
        element={
          user ? (
            <Navigate to={`/${role}/dashboard`} />
          ) : (
            <Navigate to='/login' state={{ from: '/' }} />
          )
        }
      />

      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className='min-h-screen'>
          <AppRoutes />
          <ToastContainer 
            position='top-right' 
            theme='dark'
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
