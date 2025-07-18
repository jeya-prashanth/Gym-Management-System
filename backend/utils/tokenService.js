import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getTokenPackages = async () => {
  try {
    const response = await axios.get(`${API_URL}/tokens/packages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching token packages:', error);
    throw error;
  }
};

export const purchaseTokens = async (packageId) => {
  try {
    const response = await axios.post(
      `${API_URL}/tokens/purchase`,
      { packageId },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error purchasing tokens:', error);
    throw error;
  }
};

export const getMemberTokens = async () => {
  try {
    const response = await axios.get(`${API_URL}/tokens/balance`, {
      headers: getAuthHeader()
    });
    return response.data.balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
};

export const useTokens = async (amount, serviceType) => {
  try {
    const response = await axios.post(
      `${API_URL}/tokens/use`,
      { amount, serviceType },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error using tokens:', error);
    throw error;
  }
};

export const getTransactionHistory = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/tokens/transactions`, {
      params: { page, limit },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

export const adminUpdateTokens = async (memberId, amount, reason = '') => {
  try {
    const response = await axios.post(
      `${API_URL}/admin/tokens/update`,
      { memberId, amount, reason },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating tokens:', error);
    throw error;
  }
};

export const getTokenStats = async (timeframe = 'month') => {
  try {
    const response = await axios.get(`${API_URL}/tokens/stats`, {
      params: { timeframe },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching token stats:', error);
    throw error;
  }
};

export const validateTokenUsage = async (amount) => {
  try {
    const response = await axios.get(`${API_URL}/tokens/validate-usage`, {
      params: { amount },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error validating token usage:', error);
    throw error;
  }
};

export const getTokenPackageById = async (packageId) => {
  try {
    const response = await axios.get(`${API_URL}/tokens/packages/${packageId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching token package:', error);
    throw error;
  }
};

export const generateTokenReport = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_URL}/admin/tokens/report`, {
      params: { startDate, endDate },
      headers: getAuthHeader(),
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error generating token report:', error);
    throw error;
  }
};

export const refreshTokenBalance = async () => {
  try {
    const response = await axios.get(`${API_URL}/tokens/refresh`, {
      headers: getAuthHeader()
    });
    return response.data.balance;
  } catch (error) {
    console.error('Error refreshing token balance:', error);
    throw error;
  }
};

export default {
  getTokenPackages,
  purchaseTokens,
  getMemberTokens,
  useTokens,
  getTransactionHistory,
  adminUpdateTokens,
  getTokenStats,
  validateTokenUsage,
  getTokenPackageById,
  generateTokenReport,
  refreshTokenBalance
};
