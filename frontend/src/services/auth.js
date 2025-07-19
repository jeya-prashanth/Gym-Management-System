import { post } from './api';

export const login = async (email, password) => {
  const response = await post('/auth/login', { email, password });
  localStorage.setItem('token', response.token);
  return response.user;
};

export const logout = async () => {
  localStorage.removeItem('token');
  return Promise.resolve();
};

export const refreshToken = async () => {
  const response = await post('/auth/refresh-token');
  localStorage.setItem('token', response.token);
  return response.token;
};

export const getCurrentUser = async () => {
  const response = await post('/auth/me');
  return response.user;
};

export const forgotPassword = async (email) => {
  await post('/auth/forgot-password', { email });
  return true;
};

export const resetPassword = async (token, password) => {
  await post('/auth/reset-password', { token, password });
  return true;
};
