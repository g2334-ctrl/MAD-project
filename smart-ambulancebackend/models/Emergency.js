const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  emergencyType: {
    type: String,
    enum: ['Accident / Injury', 'Medical Emergency'],
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'rejected', 'cancelled', 'arrived_patient', 'picked_up', 'hospital_notified', 'arrived_hospital', 'completed'],
    default: 'requested'
  },
  patientLocation: {
    address: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number }
  },
  driverLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  arrivedPatientAt: { type: Date },
  pickedUpAt: { type: Date },
  hospitalNotifiedAt: { type: Date },
  arrivedHospitalAt: { type: Date },
  completedAt: { type: Date },
  // v2 fields
  severity: { type: String, enum: ['critical', 'moderate', 'minor'], default: 'moderate' },
  handoverChecklist: {
    vitalsTaken: { type: Boolean, default: false },
    patientConscious: { type: Boolean, default: true },
    notes: { type: String, default: '' }
  },
  chatLog: [{
    sender: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  costEstimate: { type: Number, default: 0 },
  auditTrail: [{
    action: String,
    byRole: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);
