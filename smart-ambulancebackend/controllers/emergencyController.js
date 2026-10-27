const Emergency = require('../models/Emergency');
const Driver = require('../models/Driver');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');

// Haversine distance helper (km)
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Helper to broadcast status to all 3 roles
function broadcastStatus(io, emergency) {
  if (!io || !emergency) return;
  const pId = emergency.patient?._id || emergency.patient;
  const dId = emergency.driver?._id || emergency.driver;
  const hId = emergency.hospital?._id || emergency.hospital;

  if (pId) io.to(`patient:${pId}`).emit('emergency:status', emergency);
  if (dId) io.to(`driver:${dId}`).emit('emergency:status', emergency);
  if (hId) io.to(`hospital:${hId}`).emit('emergency:status', emergency);
}

// GET /api/emergency/nearby-services
const getNearbyServices = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).select('-password');
    const drivers = await Driver.find({}).populate('assignedHospital', 'name phone').select('-password');
    res.json({ hospitals, drivers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/emergency/request
const requestEmergency = async (req, res) => {
  try {
    const { emergencyType, severity, lat, lng, address } = req.body;
    const patientId = req.user.id;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const pLat = lat || patient.coords.lat;
    const pLng = lng || patient.coords.lng;

    // Find available drivers
    const availableDrivers = await Driver.find({ isAvailable: true });
    if (!availableDrivers.length) {
      return res.status(404).json({ message: 'No available ambulances at the moment. Please call 108.' });
    }

    // Sort by real haversine distance
    const sorted = availableDrivers
      .map((d) => ({
        driver: d,
        dist: haversineKm(pLat, pLng, d.coords.lat, d.coords.lng)
      }))
      .sort((a, b) => a.dist - b.dist);

    const nearest = sorted[0].driver;
    const distKm = sorted[0].dist;
    const costEstimate = Math.round(50 + distKm * 15);

    // Find nearest hospital with available beds
    const hospitals = await Hospital.find({ availableBeds: { $gt: 0 } });
    let targetHospital = nearest.assignedHospital;
    if (hospitals.length) {
      const sortedH = hospitals
        .map((h) => ({ hospital: h, dist: haversineKm(pLat, pLng, h.coords.lat, h.coords.lng) }))
        .sort((a, b) => a.dist - b.dist);
      targetHospital = sortedH[0].hospital._id;
    }

    const emergency = await Emergency.create({
      patient: patient._id,
      driver: nearest._id,
      hospital: targetHospital,
      emergencyType,
      severity: severity || 'moderate',
      patientLocation: { address: address || patient.currentLocation, lat: pLat, lng: pLng },
      driverLocation: { lat: nearest.coords.lat, lng: nearest.coords.lng },
      costEstimate,
      auditTrail: [{ action: 'requested', byRole: 'patient', timestamp: new Date() }]
    });

    // Mark driver busy
    await Driver.findByIdAndUpdate(nearest._id, { isAvailable: false });

    const populated = await Emergency.findById(emergency._id)
      .populate('patient', '-password')
      .populate('driver', '-password')
      .populate('hospital', '-password');

    // Notify ALL 3 roles via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`driver:${nearest._id}`).emit('emergency:new', populated);
      if (targetHospital) {
        io.to(`hospital:${targetHospital}`).emit('emergency:new', populated);
      }
      io.to(`patient:${patient._id}`).emit('emergency:status', populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/emergency/active
const getActiveEmergency = async (req, res) => {
  try {
    const { id, role } = req.user;
    let query = { status: { $nin: ['completed', 'rejected', 'cancelled'] } };
    if (role === 'patient') query.patient = id;
    else if (role === 'driver') query.driver = id;
    else if (role === 'hospital') query.hospital = id;

    const emergency = await Emergency.findOne(query)
      .sort({ createdAt: -1 })
      .populate('patient', '-password')
      .populate('driver', '-password')
      .populate('hospital', '-password');

    if (!emergency) return res.status(404).json({ message: 'No active emergency' });
    res.json(emergency);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/emergency/:id/accept
const acceptEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

    emergency.status = 'accepted';
    emergency.acceptedAt = new Date();
    emergency.auditTrail.push({ action: 'accepted', byRole: 'driver', timestamp: new Date() });
    await emergency.save();

    const populated = await Emergency.findById(emergency._id)
      .populate('patient', '-password')
      .populate('driver', '-password')
      .populate('hospital', '-password');

    broadcastStatus(req.app.get('io'), populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/emergency/:id/reject
const rejectEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

    const rejectedDriverId = emergency.driver;
    emergency.auditTrail.push({ action: 'rejected', byRole: 'driver', timestamp: new Date() });

    // Free the rejecting driver
    await Driver.findByIdAndUpdate(rejectedDriverId, { isAvailable: true });

    // Try to find next nearest available driver
    const drivers = await Driver.find({ isAvailable: true, _id: { $ne: rejectedDriverId } });
    if (!drivers.length) {
      emergency.status = 'rejected';
      await emergency.save();
      broadcastStatus(req.app.get('io'), emergency);
      return res.json({ message: 'No other drivers available', emergency });
    }

    const pLat = emergency.patientLocation.lat;
    const pLng = emergency.patientLocation.lng;
    const sorted = drivers
      .map((d) => ({ driver: d, dist: haversineKm(pLat, pLng, d.coords.lat, d.coords.lng) }))
      .sort((a, b) => a.dist - b.dist);

    const next = sorted[0].driver;
    emergency.driver = next._id;
    emergency.driverLocation = { lat: next.coords.lat, lng: next.coords.lng };
    await emergency.save();

    await Driver.findByIdAndUpdate(next._id, { isAvailable: false });

    const populated = await Emergency.findById(emergency._id)
      .populate('patient', '-password')
      .populate('driver', '-password')
      .populate('hospital', '-password');

    const io = req.app.get('io');
    if (io) {
      io.to(`driver:${next._id}`).emit('emergency:new', populated);
    }
    broadcastStatus(io, populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/emergency/:id/arrived-patient
const arrivedPatient = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });
    emergency.status = 'arrived_patient';
    emergency.arrivedPatientAt = new Date();
    emergency.auditTrail.push({ action: 'arrived_patient', byRole: 'driver', timestamp: new Date() });
    await emergency.save();

    const populated = await Emergency.findById(emergency._id)
      .populate('patient', '-password').populate('driver', '-password').populate('hospital', '-password');

    broadcastStatus(req.app.get('io'), populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/emergency/:id/pickup
const pickupPatient = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });
    emergency.status = 'picked_up';
    emergency.pickedUpAt = new Date();
    emergency.auditTrail.push({ action: 'picked_up', byRole: 'driver', timestamp: new Date() });
    await emergency.save();

    const populated = await Emergency.findById(emergency._id)
      .populate('patient', '-password').populate('driver', '-password').populate('hospital', '-password');

    broadcastStatus(req.app.get('io'), populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/emergency/:id/handover-checklist
const handoverChecklist = async (req, res) => {
  try {
    const { vitalsTaken, patientConscious, notes } = req.body;
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });
    emergency.handoverChecklist = { vitalsTaken, patientConscious, notes };
    emergency.auditTrail.push({ action: 'handover_checklist', byRole: 'driver', timestamp: new Date() });
    await emergency.save();

    const populated = await Emergency.findById(emergency._id)
      .populate('patient', '-password').populate('driver', '-password').populate('hospital', '-password');

    broadcastStatus(req.app.get('io'), populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/emergency/:id/inform-hospital
const informHospital = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });
    emergency.status = 'hospital_notified';
    emergency.hospitalNotifiedAt = new Date();
    emergency.auditTrail.push({ action: 'hospital_notified', byRole: 'driver', timestamp: new Date() });
    await emergency.save();

    const populated = await Emergency.findById(emergency._id)
      .populate('patient', '-password').populate('driver', '-password').populate('hospital', '-password');

    const io = req.app.get('io');
    if (io) {
      const hospId = emergency.hospital?._id || emergency.hospital;
      if (hospId) io.to(`hospital:${hospId}`).emit('emergency:hospitalNotified', populated);
    }
    broadcastStatus(io, populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/emergency/:id/arrived-hospital
const arrivedHospital = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });
    emergency.status = 'arrived_hospital';
    emergency.arrivedHospitalAt = new Date();
    emergency.auditTrail.push({ action: 'arrived_hospital', byRole: 'driver', timestamp: new Date() });
    await emergency.save();

    const populated = await Emergency.findById(emergency._id)
      .populate('patient', '-password').populate('driver', '-password').populate('hospital', '-password');

    broadcastStatus(req.app.get('io'), populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/emergency/:id/complete
const completeEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });
    emergency.status = 'completed';
    emergency.completedAt = new Date();
    emergency.auditTrail.push({ action: 'completed', byRole: 'hospital', timestamp: new Date() });
    await emergency.save();

    // Free driver and increment trip count
    await Driver.findByIdAndUpdate(emergency.driver, {
      isAvailable: true,
      $inc: { totalTripsToday: 1 }
    });

    // Decrement available beds at hospital
    if (emergency.hospital) {
      await Hospital.findByIdAndUpdate(emergency.hospital, {
        $inc: { availableBeds: -1 }
      });
    }

    const populated = await Emergency.findById(emergency._id)
      .populate('patient', '-password').populate('driver', '-password').populate('hospital', '-password');

    broadcastStatus(req.app.get('io'), populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/emergency/:id/location (driver GPS ping)
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { driverLocation: { lat, lng } },
      { new: true }
    );
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

    const io = req.app.get('io');
    if (io) {
      const payload = { emergencyId: emergency._id, lat, lng };
      if (emergency.patient) io.to(`patient:${emergency.patient}`).emit('location:update', payload);
      if (emergency.hospital) io.to(`hospital:${emergency.hospital}`).emit('location:update', payload);
    }
    res.json({ lat, lng });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/emergency/:id/chat
const sendChat = async (req, res) => {
  try {
    const { message } = req.body;
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

    const chatEntry = { sender: req.user.role, message, timestamp: new Date() };
    emergency.chatLog.push(chatEntry);
    await emergency.save();

    const io = req.app.get('io');
    if (io) {
      const pId = emergency.patient?._id || emergency.patient;
      const dId = emergency.driver?._id || emergency.driver;
      const hId = emergency.hospital?._id || emergency.hospital;

      if (req.user.role === 'patient') {
        if (dId) io.to(`driver:${dId}`).emit('chat:message', chatEntry);
        if (hId) io.to(`hospital:${hId}`).emit('chat:message', chatEntry);
      } else if (req.user.role === 'driver') {
        if (pId) io.to(`patient:${pId}`).emit('chat:message', chatEntry);
        if (hId) io.to(`hospital:${hId}`).emit('chat:message', chatEntry);
      } else {
        if (pId) io.to(`patient:${pId}`).emit('chat:message', chatEntry);
        if (dId) io.to(`driver:${dId}`).emit('chat:message', chatEntry);
      }
    }
    res.json(chatEntry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/emergency/:id/cancel
const cancelEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

    emergency.status = 'cancelled';
    emergency.auditTrail.push({ action: 'cancelled', byRole: req.user?.role || 'patient', timestamp: new Date() });
    await emergency.save();

    if (emergency.driver) {
      await Driver.findByIdAndUpdate(emergency.driver, { isAvailable: true });
    }

    broadcastStatus(req.app.get('io'), emergency);
    res.json({ message: 'Emergency request cancelled', emergency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getNearbyServices,
  requestEmergency,
  getActiveEmergency,
  acceptEmergency,
  rejectEmergency,
  cancelEmergency,
  arrivedPatient,
  pickupPatient,
  handoverChecklist,
  informHospital,
  arrivedHospital,
  completeEmergency,
  updateLocation,
  sendChat
};
