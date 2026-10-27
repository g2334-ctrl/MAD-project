const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hospitalId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  adminName: { type: String, default: '' },
  coords: {
    lat: { type: Number, default: 11.0025 },
    lng: { type: Number, default: 76.9615 }
  },
  // v2 fields
  totalBeds: { type: Number, default: 100 },
  availableBeds: { type: Number, default: 30 },
  departments: [{ type: String }],
  icuAvailable: { type: Number, default: 5 }
}, { timestamps: true });

hospitalSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

hospitalSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Hospital', hospitalSchema);
