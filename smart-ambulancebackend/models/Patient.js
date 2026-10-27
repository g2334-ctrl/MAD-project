const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  altMobile: { type: String, default: '' },
  currentLocation: { type: String, default: '' },
  nativePlace: { type: String, default: '' },
  coords: {
    lat: { type: Number, default: 11.0168 },
    lng: { type: Number, default: 76.9558 }
  },
  // v2 fields
  bloodGroup: { type: String, default: '' },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  emergencyContacts: [{ name: String, mobile: String }],
  preferredLanguage: { type: String, default: 'en' }
}, { timestamps: true });

patientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

patientSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Patient', patientSchema);
