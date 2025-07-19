import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/axios';
import { getCurrentUser } from '../services/auth';

const AuthContext = createContext();

// Create a wrapper component that will use the navigate hook
const AuthProviderWrapper = ({ children }) => {
  const navigate = useNavigate();
  
  return <AuthProvider navigate={navigate}>{children}</AuthProvider>;
};

const AuthProvider = ({ children, navigate }) => {
  const [authState, setAuthState] = useState({
    user: null,
    gym: null,
    role: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setAuthState({
            user: null,
            gym: null,
            role: decoded.role,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Token decode error:', error);
          localStorage.removeItem('token');
          setAuthState({
            user: null,
            gym: null,
            role: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Handle navigation after successful login - removed to prevent conflicts with ProtectedRoute
  // Navigation is now handled in the login function and ProtectedRoute component

  const login = useCallback(async (email, password) => {
    try {
      // Set loading state
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Call the auth service to login using the configured axios instance
      const response = await api.post('/auth/login', { email, password });
      
      if (!response?.data?.token) {
        throw new Error('Invalid response from server');
      }
      
      const { token, ...userData } = response.data;
      const decoded = jwtDecode(token);
      
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Update auth state in a single call
      const newAuthState = {
        user: userData,
        gym: decoded.role === 'gym' ? userData : null,
        role: decoded.role,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
      setAuthState(newAuthState);
      
      // Return the decoded user data including role for navigation in the component
      return { success: true, role: decoded.role };
    } catch (error) {
      console.error('Login error:', error);
      // Reset auth state on error
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Login failed. Please check your credentials.'
      }));
      
      // Create a new error with the message we want to display
      const loginError = new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      loginError.response = error.response; // Preserve the response for further inspection
      throw loginError; // Re-throw the error to be caught by the Login component
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      gym: null,
      role: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    navigate('/login');
  }, [navigate]);

  const updateUser = useCallback((userData) => {
    setAuthState(prev => ({
      ...prev,
      user: { ...prev.user, ...userData },
      gym: prev.role === 'gym' ? { ...prev.gym, ...userData } : prev.gym
    }));
  }, []);

  const hasRole = useCallback((requiredRole) => {
    if (!authState.role) return false;
    if (authState.role === 'admin') return true;
    return authState.role === requiredRole;
  }, [authState.role]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    ...authState,
    login,
    logout,
    updateUser,
    hasRole
  }), [authState, login, logout, updateUser, hasRole]);

  return (
    <AuthContext.Provider value={value}>
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};

export { AuthProviderWrapper as AuthProvider };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
