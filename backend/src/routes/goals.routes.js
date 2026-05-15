const express = require('express');
const router = express.Router();
const passport = require('passport');
const goalsController = require('../controllers/goals.controller');

router.get('/', passport.authenticate('jwt', { session: false }), goalsController.getGoals);
router.post('/', passport.authenticate('jwt', { session: false }), goalsController.createGoal);
router.put('/:goalId', passport.authenticate('jwt', { session: false }), goalsController.updateGoal);
router.delete('/:goalId', passport.authenticate('jwt', { session: false }), goalsController.deleteGoal);

module.exports = router;
