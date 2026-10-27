const Driver = require('../models/Driver');
const Hospital = require('../models/Hospital');
const generateToken = require('../utils/generateToken');

// POST /api/drivers/register
const registerDriver = async (req, res) => {
  try {
    const { name, mobile, email, password, altMobile, ambulanceNumber, assignedHospitalId, fleetType } = req.body;
    const exists = await Driver.findOne({ $or: [{ mobile }, { email }, { ambulanceNumber }] });
    if (exists) return res.status(400).json({ message: 'Driver already exists' });

    let hospital = null;
    if (assignedHospitalId) {
      hospital = await Hospital.findOne({ hospitalId: assignedHospitalId });
    }

    const driver = await Driver.create({
      name, mobile, email, password, altMobile, ambulanceNumber,
      assignedHospital: hospital ? hospital._id : null,
      fleetType: fleetType || 'hospital-owned',
      shiftStartTime: new Date()
    });
    const token = generateToken(driver._id, 'driver');
    res.status(201).json({ token, user: sanitize(driver) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/drivers/login
const loginDriver = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const driver = await Driver.findOne({ mobile }).populate('assignedHospital', 'name hospitalId coords');
    if (!driver || !(await driver.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(driver._id, 'driver');
    res.json({ token, user: sanitize(driver) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/drivers/me
const getMe = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id)
      .select('-password')
      .populate('assignedHospital', 'name hospitalId coords address');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/drivers/location
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.user.id,
      { coords: { lat, lng } },
      { new: true }
    ).select('-password');
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/drivers/shift
const updateShift = async (req, res) => {
  try {
    const { shiftStartTime, fatigueFlag, isAvailable } = req.body;
    const update = {};
    if (shiftStartTime !== undefined) update.shiftStartTime = shiftStartTime;
    if (fatigueFlag !== undefined) update.fatigueFlag = fatigueFlag;
    if (isAvailable !== undefined) update.isAvailable = isAvailable;
    const driver = await Driver.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sanitize = (d) => ({
  _id: d._id,
  name: d.name,
  mobile: d.mobile,
  email: d.email,
  altMobile: d.altMobile,
  ambulanceNumber: d.ambulanceNumber,
  assignedHospital: d.assignedHospital,
  isAvailable: d.isAvailable,
  coords: d.coords,
  shiftStartTime: d.shiftStartTime,
  totalTripsToday: d.totalTripsToday,
  fatigueFlag: d.fatigueFlag,
  fleetType: d.fleetType
});

module.exports = { registerDriver, loginDriver, getMe, updateLocation, updateShift };
