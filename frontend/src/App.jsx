import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

// Member Pages
import MemberDashboard from './pages/MemberDashboard';
import PlanSelection from './pages/PlanSelection';
import MockPayment from './pages/MockPayment';
import VisitHistory from './pages/VisitHistory';
import Profile from './pages/Profile';

// Gym Pages
import GymDashboard from './pages/GymDashboard';
import Members from './pages/gym/Members';
import Schedule from './pages/gym/Schedule';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import CreateGym from './pages/admin/CreateGym';
import ManageGym from './pages/admin/ManageGym';
import EditGym from './pages/admin/EditGym';
import ManageMember from './pages/admin/ManageMember';

// Layouts
import MemberLayout from './layouts/MemberLayout';
import GymLayout from './layouts/GymLayout';
import AdminLayout from './layouts/AdminLayout';

const App = () => {
  return (
    <Router>
      <div className='bg-[#0e121d] min-h-screen'>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Landing />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />

          {/* Member Routes */}
          <Route path='/member' element={<MemberLayout username='Jeya Prashanth' />}>
            <Route index element={<MemberDashboard />} />
            <Route path='dashboard' element={<MemberDashboard />} />
            <Route path='plans' element={<PlanSelection />} />
            <Route path='payment' element={<MockPayment />} />
            <Route path='history' element={<VisitHistory />} />
            <Route path='profile' element={<Profile />} />
          </Route>

          {/* Gym Routes */}
          <Route path='/gym' element={<GymLayout gymName='' />}>
            <Route index element={<GymDashboard />} />
            <Route path='dashboard' element={<GymDashboard />} />
            <Route path='members' element={<Members />} />
            <Route path='schedule' element={<Schedule />} />
          </Route>

          {/* Admin Routes */}
          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path='create-gym' element={<CreateGym />} />
            <Route path='manage-gym' element={<ManageGym />} />
            <Route path='edit-gym/:id' element={<EditGym />} />
            
            <Route path='member' element={<ManageMember />} />
            <Route path='analytics' element={<div>Analytics</div>} />
            <Route path='settings' element={<div>Settings</div>} />
          </Route>

          {/* 404 - Not Found Route */}
          <Route path='*' element={<NotFound />} />
        </Routes>
        <ToastContainer 
          position='top-right' 
          theme='dark' 
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
};

export default App;
