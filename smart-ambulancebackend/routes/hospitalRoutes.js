const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createHospital, loginHospital, getMe, updateBeds
} = require('../controllers/hospitalController');

router.post('/create', createHospital);
router.post('/login', loginHospital);
router.get('/me', protect(['hospital']), getMe);
router.put('/beds', protect(['hospital']), updateBeds);

module.exports = router;
