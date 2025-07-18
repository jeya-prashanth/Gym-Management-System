import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true, default: Date.now },
  checkIn: { type: Date, required: true, default: Date.now },
  checkOut: { type: Date },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'present' },
  tokenUsed: { type: Number, default: 1, min: 0 },
  notes: { type: String, trim: true, maxlength: 500 },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
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
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

attendanceSchema.index({ member: 1, date: -1 });
attendanceSchema.index({ class: 1, date: -1 });
attendanceSchema.index({ status: 1, date: -1 });

attendanceSchema.virtual('duration').get(function() {
  if (this.checkIn && this.checkOut) {
    return Math.round((this.checkOut - this.checkIn) / (1000 * 60));
  }
  return null;
});

attendanceSchema.pre('save', function(next) {
  if (!this.checkIn) {
    this.checkIn = new Date();
  }
  next();
});

attendanceSchema.statics.markAttendance = async function(memberId, classId, staffId, status = 'present') {
  return this.create({
    member: memberId,
    class: classId,
    status,
    recordedBy: staffId
  });
};

attendanceSchema.methods.markCheckOut = async function() {
  if (this.checkOut) {
    throw new Error('Already checked out');
  }
  this.checkOut = new Date();
  return this.save();
};

attendanceSchema.methods.isActive = function() {
  return this.checkIn && !this.checkOut;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
