import mongoose from 'mongoose';

const transactionTypes = ['credit', 'debit'];
const relatedToTypes = ['class_attendance', 'admin_adjustment', 'system', 'other'];

const tokenTransactionSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true,
    validate: {validator: Number.isInteger, message: 'Token amount must be an integer' } },
  type: { type: String, required: true, enum: transactionTypes, index: true },
  reference: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relatedTo: { type: String, enum: relatedToTypes, default: 'other' },
  relatedDocument: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedTo' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

tokenTransactionSchema.pre('save', function(next) {
  if (!this.reference) {
    const date = new Date();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.reference = `TXN-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${random}`;
  }
  next();
});

tokenTransactionSchema.statics.recordTransaction = async function(transactionData) {
  if (!transactionTypes.includes(transactionData.type)) {
    throw new Error(`Invalid transaction type. Must be one of: ${transactionTypes.join(', ')}`);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const transaction = await this.create([transactionData], { session });
    
    const update = transactionData.type === 'credit' 
      ? { $inc: { tokenBalance: transactionData.amount } }
      : { $inc: { tokenBalance: -Math.abs(transactionData.amount) } };
    
    await mongoose.model('User').findByIdAndUpdate(
      transactionData.member,
      update,
      { session, new: true }
    );
    
    await session.commitTransaction();
    return transaction[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

tokenTransactionSchema.statics.getBalance = async function(userId) {
  const result = await this.aggregate([
    { $match: { member: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        balance: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'credit'] },
              '$amount',
              { $multiply: ['$amount', -1] }
            ]
          }
        }
      }
    }
  ]);
  
  return result[0]?.balance || 0;
};

// Query helpers
tokenTransactionSchema.query.byUser = function(userId) {
  return this.where({ member: userId });
};

tokenTransactionSchema.query.byType = function(type) {
  return this.where({ type });
};

const TokenTransaction = mongoose.model('TokenTransaction', tokenTransactionSchema);
export default TokenTransaction;
