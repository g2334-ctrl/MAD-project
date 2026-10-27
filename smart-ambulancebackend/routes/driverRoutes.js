const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  registerDriver, loginDriver, getMe, updateLocation, updateShift
} = require('../controllers/driverController');

router.post('/register', registerDriver);
router.post('/login', loginDriver);
router.get('/me', protect(['driver']), getMe);
router.put('/location', protect(['driver']), updateLocation);
router.put('/shift', protect(['driver']), updateShift);

module.exports = router;
