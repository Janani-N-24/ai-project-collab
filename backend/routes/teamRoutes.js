const express = require('express');
const { createTeam, getMyTeams, getTeamById, inviteMember } = require('../controllers/teamController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // every team route requires authentication

router.route('/').post(createTeam).get(getMyTeams);
router.route('/:id').get(getTeamById);
router.route('/:id/members').post(inviteMember);

module.exports = router;
