const Hospital = require('../models/Hospital');
const generateToken = require('../utils/generateToken');

// POST /api/hospitals/create
const createHospital = async (req, res) => {
  try {
    const { name, hospitalId, password, address, city, pincode, phone, email, adminName,
      totalBeds, availableBeds, departments, icuAvailable } = req.body;
    const exists = await Hospital.findOne({ hospitalId });
    if (exists) return res.status(400).json({ message: 'Hospital ID already registered' });

    const hospital = await Hospital.create({
      name, hospitalId, password, address, city, pincode, phone, email, adminName,
      totalBeds: totalBeds || 100,
      availableBeds: availableBeds || 30,
      departments: departments || ['Emergency', 'Trauma', 'Cardiac', 'Pediatric'],
      icuAvailable: icuAvailable || 5
    });
    const token = generateToken(hospital._id, 'hospital');
    res.status(201).json({ token, user: sanitize(hospital) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/hospitals/login
const loginHospital = async (req, res) => {
  try {
    const { hospitalId, password } = req.body;
    const hospital = await Hospital.findOne({ hospitalId });
    if (!hospital || !(await hospital.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(hospital._id, 'hospital');
    res.json({ token, user: sanitize(hospital) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/hospitals/me
const getMe = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id).select('-password');
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/hospitals/beds
const updateBeds = async (req, res) => {
  try {
    const { availableBeds, icuAvailable, totalBeds } = req.body;
    const update = {};
    if (availableBeds !== undefined) update.availableBeds = availableBeds;
    if (icuAvailable !== undefined) update.icuAvailable = icuAvailable;
    if (totalBeds !== undefined) update.totalBeds = totalBeds;
    const hospital = await Hospital.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sanitize = (h) => ({
  _id: h._id,
  name: h.name,
  hospitalId: h.hospitalId,
  address: h.address,
  city: h.city,
  pincode: h.pincode,
  phone: h.phone,
  email: h.email,
  adminName: h.adminName,
  coords: h.coords,
  totalBeds: h.totalBeds,
  availableBeds: h.availableBeds,
  departments: h.departments,
  icuAvailable: h.icuAvailable
});

module.exports = { createHospital, loginHospital, getMe, updateBeds };
