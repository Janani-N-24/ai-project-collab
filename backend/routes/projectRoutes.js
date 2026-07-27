const express = require('express');
const { createProject, getProjectsByTeam, getProjectById } = require('../controllers/projectController');
const { generateTaskBreakdown } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').post(createProject).get(getProjectsByTeam);
router.route('/:id').get(getProjectById);
router.post('/:id/ai-breakdown', generateTaskBreakdown);

module.exports = router;
