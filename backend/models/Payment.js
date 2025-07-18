import mongoose from 'mongoose';

const paymentStatus = ['pending', 'completed', 'failed', 'refunded'];
const paymentMethods = ['cash', 'card', 'online', 'wallet', 'other'];

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  tokens: { type: Number, required: true, min: 0 },
  status: { type: String, enum: paymentStatus, default: 'pending', index: true },
  method: { type: String, enum: paymentMethods, required: true },
  transactionId: { type: String, unique: true, sparse: true },
  paymentDate: { type: Date, default: Date.now },
  description: { type: String, trim: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

paymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    const date = new Date();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.transactionId = `PAY-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${random}`;
  }
  next();
});

paymentSchema.statics.recordPayment = async function(paymentData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const payment = await this.create([{
      ...paymentData,
      status: 'completed'
    }], { session });
    
    await mongoose.model('User').findByIdAndUpdate(
      paymentData.user,
      { $inc: { tokenBalance: paymentData.tokens } },
      { session, new: true }
    );
    
    await session.commitTransaction();
    return payment[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

paymentSchema.statics.getUserPayments = function(userId, { page = 1, limit = 10 } = {}) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

paymentSchema.query.byStatus = function(status) {
  return this.where({ status });
};

paymentSchema.query.byMethod = function(method) {
  return this.where({ method });
};

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
