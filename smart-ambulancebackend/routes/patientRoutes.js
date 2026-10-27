const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  registerPatient, loginPatient, getMe, updateLocation, updateMedicalProfile
} = require('../controllers/patientController');

router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.get('/me', protect(['patient']), getMe);
router.put('/location', protect(['patient']), updateLocation);
router.put('/medical-profile', protect(['patient']), updateMedicalProfile);

module.exports = router;
