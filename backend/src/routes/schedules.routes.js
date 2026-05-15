const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const schedulesController = require('../controllers/schedules.controller');

router.get('/', auth, schedulesController.getSchedules);
router.post('/', auth, schedulesController.createSchedule);
router.put('/:scheduleId', auth, schedulesController.updateSchedule);
router.patch('/:scheduleId/status', auth, schedulesController.pauseSchedule);
router.delete('/:scheduleId', auth, schedulesController.deleteSchedule);

module.exports = router;
