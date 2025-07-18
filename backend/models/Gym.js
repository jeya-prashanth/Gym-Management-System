import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/] },
  phone: { type: String, required: true, match: [/^[0-9\-\+]{9,15}$/] },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    country: { type: String, default: 'Colombo' },
    pincode: { type: String, trim: true }
  },
  operatingHours: {
    weekdays: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' }
    },
    weekends: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '20:00' }
    }
  },
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  features: [{ name: String, isAvailable: { type: Boolean, default: true } }]
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

gymSchema.virtual('fullAddress').get(function() {
  const { street, city, state, country, pincode } = this.address;
  return [street, city, state, pincode, country].filter(Boolean).join(', ');
});

gymSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId });
};

gymSchema.statics.getActiveGyms = function() {
  return this.find({ isActive: true });
};

gymSchema.methods.addMember = function(memberId) {
  if (!this.members.includes(memberId)) {
    this.members.push(memberId);
  }
  return this.save();
};

gymSchema.methods.removeMember = function(memberId) {
  this.members = this.members.filter(id => !id.equals(memberId));
  return this.save();
};

const Gym = mongoose.model('Gym', gymSchema);
export default Gym;
