const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
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
} = require('../controllers/emergencyController');

router.get('/nearby-services', protect(['patient', 'driver', 'hospital']), getNearbyServices);
router.post('/request', protect(['patient']), requestEmergency);
router.get('/active', protect(['patient', 'driver', 'hospital']), getActiveEmergency);
router.put('/:id/accept', protect(['driver']), acceptEmergency);
router.put('/:id/reject', protect(['driver']), rejectEmergency);
router.put('/:id/cancel', protect(['patient', 'driver']), cancelEmergency);
router.put('/:id/arrived-patient', protect(['driver']), arrivedPatient);
router.put('/:id/pickup', protect(['driver']), pickupPatient);
router.put('/:id/handover-checklist', protect(['driver']), handoverChecklist);
router.put('/:id/inform-hospital', protect(['driver']), informHospital);
router.put('/:id/arrived-hospital', protect(['driver']), arrivedHospital);
router.put('/:id/complete', protect(['hospital']), completeEmergency);
router.put('/:id/location', protect(['driver']), updateLocation);
router.post('/:id/chat', protect(['patient', 'driver', 'hospital']), sendChat);

module.exports = router;
