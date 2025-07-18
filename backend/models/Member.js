import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  memberId: { type: String, unique: true, required: true },
  tokenBalance: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  lastCheckIn: Date,
  checkInCount: { type: Number, default: 0 },
  emergencyContact: { name: String, relationship: String,
    phone: { type: String, match: [/^[0-9\-\+]{9,15}$/] }
  },
  notes: { type: String, maxlength: 500 }
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

memberSchema.pre('save', async function(next) {
  if (!this.memberId) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.memberId = `MEM-${yearMonth}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

memberSchema.methods.addTokens = async function(amount) {
  if (amount <= 0) throw new Error('Amount must be positive');
  this.tokenBalance += amount;
  return this.save();
};

memberSchema.methods.useTokens = async function(amount) {
  if (amount <= 0) throw new Error('Amount must be positive');
  if (this.tokenBalance < amount) throw new Error('Insufficient token balance');
  this.tokenBalance -= amount;
  return this.save();
};

memberSchema.methods.recordCheckIn = async function() {
  this.lastCheckIn = new Date();
  this.checkInCount += 1;
  return this.save();
};

memberSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

memberSchema.statics.getByUserId = function(userId) {
  return this.findOne({ user: userId });
};

memberSchema.statics.getMemberStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalMembers: { $sum: 1 },
        activeMembers: { $sum: { $cond: ['$isActive', 1, 0] } },
        totalTokens: { $sum: '$tokenBalance' }
      }
    }
  ]);
};

memberSchema.index({ memberId: 1 });
memberSchema.index({ isActive: 1 });
memberSchema.index({ 'user': 1, 'isActive': 1 });

const Member = mongoose.model('Member', memberSchema);
export default Member;
