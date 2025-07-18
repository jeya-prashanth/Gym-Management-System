import { v4 as uuidv4 } from 'uuid';

const memberTokens = new Map();

const TOKEN_PACKAGES = {
  BASIC: { id: 'basic', name: 'Basic Package', tokens: 10, price: 0 },
  STANDARD: { id: 'standard', name: 'Standard Package', tokens: 30, price: 0 },
  PREMIUM: { id: 'premium', name: 'Premium Package', tokens: 100, price: 0 }
};

export const getTokenPackages = () => {
  return Object.values(TOKEN_PACKAGES);
};

export const getMemberTokens = (memberId) => {
  return memberTokens.get(memberId) || 0;
};

export const purchaseTokens = (memberId, packageId) => {
  const tokenPackage = Object.values(TOKEN_PACKAGES).find(pkg => pkg.id === packageId);
  
  if (!tokenPackage) {
    throw new Error('Invalid token package');
  }

  const currentTokens = getMemberTokens(memberId);
  const newTokenBalance = currentTokens + tokenPackage.tokens;
  
  memberTokens.set(memberId, newTokenBalance);
  
  const transaction = {
    id: `txn_${uuidv4().replace(/-/g, '')}`,
    memberId,
    packageId: tokenPackage.id,
    packageName: tokenPackage.name,
    tokens: tokenPackage.tokens,
    price: tokenPackage.price,
    timestamp: new Date().toISOString(),
    status: 'completed',
    paymentMethod: 'free',
    transactionId: `free_${Date.now()}`
  };

  return {
    success: true,
    message: 'Tokens added successfully',
    transaction,
    newBalance: newTokenBalance
  };
};

export const useTokens = (memberId, amount) => {
  const currentTokens = getMemberTokens(memberId);
  
  if (currentTokens < amount) {
    return {
      success: false,
      message: 'Insufficient tokens',
      currentBalance: currentTokens
    };
  }
  
  const newTokenBalance = currentTokens - amount;
  memberTokens.set(memberId, newTokenBalance);
  
  return {
    success: true,
    message: 'Tokens used successfully',
    tokensUsed: amount,
    newBalance: newTokenBalance
  };
};

export const getTransactionHistory = (memberId) => {
  return [];
};

export const adminUpdateTokens = (memberId, amount, reason = '') => {
  const currentTokens = getMemberTokens(memberId);
  const newTokenBalance = currentTokens + amount;
  
  if (newTokenBalance < 0) {
    throw new Error('Token balance cannot be negative');
  }
  
  memberTokens.set(memberId, newTokenBalance);
  
  return {
    success: true,
    message: 'Tokens updated successfully',
    previousBalance: currentTokens,
    newBalance: newTokenBalance,
    change: amount,
    reason
  };
};

export default {
  getTokenPackages,
  getMemberTokens,
  purchaseTokens,
  useTokens,
  getTransactionHistory,
  adminUpdateTokens
};
