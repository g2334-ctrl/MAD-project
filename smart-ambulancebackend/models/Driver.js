const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  altMobile: { type: String, default: '' },
  currentLocation: { type: String, default: '' },
  nativePlace: { type: String, default: '' },
  ambulanceNumber: { type: String, required: true, unique: true },
  assignedHospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  isAvailable: { type: Boolean, default: true },
  coords: {
    lat: { type: Number, default: 11.0096 },
    lng: { type: Number, default: 76.9707 }
  },
  // v2 fields
  shiftStartTime: { type: Date },
  totalTripsToday: { type: Number, default: 0 },
  fatigueFlag: { type: Boolean, default: false },
  fleetType: { type: String, enum: ['hospital-owned', 'private'], default: 'hospital-owned' }
}, { timestamps: true });

driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

driverSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Driver', driverSchema);
