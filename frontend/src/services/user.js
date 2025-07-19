import { get, post, put, del } from './api';

export const getProfile = async () => {
  return await get('/users/me');
};

export const updateProfile = async (userData) => {
  return await put('/users/me', userData);
};

export const changePassword = async (currentPassword, newPassword) => {
  return await post('/users/change-password', { currentPassword, newPassword });
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return await post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getUsers = async (params = {}) => {
  return await get('/users', { params });
};

export const getUserById = async (userId) => {
  return await get(`/users/${userId}`);
};

export const createUser = async (userData) => {
  return await post('/users', userData);
};

export const updateUser = async (userId, userData) => {
  return await put(`/users/${userId}`, userData);
};

export const deleteUser = async (userId) => {
  return await del(`/users/${userId}`);
};
