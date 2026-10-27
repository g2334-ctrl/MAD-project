const Patient = require('../models/Patient');
const generateToken = require('../utils/generateToken');

// POST /api/patients/register
const registerPatient = async (req, res) => {
  try {
    const { name, mobile, email, password, altMobile, currentLocation, nativePlace } = req.body;
    const exists = await Patient.findOne({ $or: [{ mobile }, { email }] });
    if (exists) return res.status(400).json({ message: 'Patient already exists with this mobile or email' });

    const patient = await Patient.create({ name, mobile, email, password, altMobile, currentLocation, nativePlace });
    const token = generateToken(patient._id, 'patient');
    res.status(201).json({ token, user: sanitize(patient) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/patients/login
const loginPatient = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const patient = await Patient.findOne({ mobile });
    if (!patient || !(await patient.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(patient._id, 'patient');
    res.json({ token, user: sanitize(patient) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/patients/me
const getMe = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select('-password');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/patients/location
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.user.id,
      { coords: { lat, lng } },
      { new: true }
    ).select('-password');
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/patients/medical-profile
const updateMedicalProfile = async (req, res) => {
  try {
    const { bloodGroup, allergies, chronicConditions, emergencyContacts, preferredLanguage } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.user.id,
      { bloodGroup, allergies, chronicConditions, emergencyContacts, preferredLanguage },
      { new: true }
    ).select('-password');
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sanitize = (p) => ({
  _id: p._id,
  name: p.name,
  mobile: p.mobile,
  email: p.email,
  altMobile: p.altMobile,
  currentLocation: p.currentLocation,
  nativePlace: p.nativePlace,
  coords: p.coords,
  bloodGroup: p.bloodGroup,
  allergies: p.allergies,
  chronicConditions: p.chronicConditions,
  emergencyContacts: p.emergencyContacts,
  preferredLanguage: p.preferredLanguage
});

module.exports = { registerPatient, loginPatient, getMe, updateLocation, updateMedicalProfile };
