import mongoose from 'mongoose';
import User from './User.js';
import Member from './Member.js';
import Payment from './Payment.js';
import TokenTransaction from './TokenTransaction.js';

const models = {
  User,
  Member,
  Payment,
  TokenTransaction
};

Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

export {
  User,
  Member,
  Payment,
  TokenTransaction,
  mongoose
};

export default mongoose;

export const getModel = (modelName) => {
  const model = models[modelName];
  if (!model) {
    throw new Error(`Model '${modelName}' not found`);
  }
  return model;
};

export const checkConnection = () => ({
  isConnected: mongoose.connection.readyState === 1,
  state: {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  }[mongoose.connection.readyState] || 'unknown'
});
