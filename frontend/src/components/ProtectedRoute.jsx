import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectPath = '/login',
  showToast = true,
}) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getRedirectPath = useMemo(() => {
    if (!isAuthenticated || !role) return redirectPath;
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      return {
        admin: '/admin/dashboard',
        gym: '/gym/dashboard',
        member: '/member/dashboard',
      }[role] || '/';
    }
    
    return null;
  }, [isAuthenticated, role, allowedRoles, redirectPath]);

  useEffect(() => {
    if (isLoading) return; 
    
    const currentPath = window.location.pathname;
    const isAuthPage = ['/login', '/signup'].includes(currentPath);
    
    if (showToast && !isAuthPage) {
      if (!isAuthenticated) {
        const isComingFromLogout = location.state?.from?.pathname === '/login';
        if (!isComingFromLogout) {
          toast.error('Please log in to access this page');
        }
      } else if (getRedirectPath) {
        toast.error('You do not have permission to access this page');
      }
    }
  }, [isAuthenticated, getRedirectPath, showToast, isLoading, location.state]);

  useEffect(() => {
    if (isLoading) return; 
    
    if (!isAuthenticated || !user || !role) {
      return;
    }
    
    if (getRedirectPath) {
      if (window.location.pathname !== getRedirectPath) {
        navigate(getRedirectPath, { replace: true });
      }
    }
  }, [isAuthenticated, user, role, getRedirectPath, navigate, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated || !user || !role) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (getRedirectPath) {
    return <Navigate to={getRedirectPath} state={{ from: location }} replace />;
  }

  return children;
};

export default React.memo(ProtectedRoute);
