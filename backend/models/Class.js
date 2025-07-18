import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  schedule: {
    day: { type: String, required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    duration: { type: Number, required: true, min: 15 }
  },
  maxCapacity: { type: Number, required: true, min: 1 },
  currentEnrollment: { type: Number, default: 0, min: 0 },
  tokenCost: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true, index: true },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
  }]
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

classSchema.virtual('schedule.endTime').get(function() {
  if (!this.schedule?.startTime || !this.schedule?.duration) return null;
  
  const [hours, minutes] = this.schedule.startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + this.schedule.duration * 60000);
  return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
});

classSchema.methods.hasAvailableSpots = function() {
  return this.currentEnrollment < this.maxCapacity;
};

classSchema.methods.incrementEnrollment = async function(userId) {
  if (this.currentEnrollment >= this.maxCapacity) {
    throw new Error('Class is full');
  }
  
  const isAlreadyEnrolled = this.participants.some(p => p.user.equals(userId));
  if (isAlreadyEnrolled) {
    throw new Error('User already enrolled in this class');
  }
  
  this.currentEnrollment += 1;
  this.participants.push({ user: userId });
  return this.save();
};

classSchema.methods.decrementEnrollment = async function(userId) {
  const participantIndex = this.participants.findIndex(p => p.user.equals(userId));
  if (participantIndex === -1) {
    throw new Error('User not enrolled in this class');
  }
  
  this.participants.splice(participantIndex, 1);
  this.currentEnrollment = Math.max(0, this.currentEnrollment - 1);
  return this.save();
};

classSchema.statics.findByTrainer = function(trainerId) {
  return this.find({ trainer: trainerId });
};

classSchema.statics.findByGym = function(gymId) {
  return this.find({ gym: gymId });
};

const Class = mongoose.model('Class', classSchema);
export default Class;
