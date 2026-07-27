const Team = require('../models/Team');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Create a new team (creator becomes the owner)
// @route   POST /api/teams
// @access  Private
const createTeam = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Team name is required');
  }

  const team = await Team.create({
    name: name.trim(),
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
  });

  const populatedTeam = await team.populate('members.user', 'name email avatarUrl');

  res.status(201).json({ success: true, team: populatedTeam });
});

// @desc    Get all teams the logged-in user belongs to
// @route   GET /api/teams
// @access  Private
const getMyTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ 'members.user': req.user._id })
    .populate('members.user', 'name email avatarUrl')
    .sort({ createdAt: -1 });

  res.json({ success: true, teams });
});

// @desc    Get a single team with its members
// @route   GET /api/teams/:id
// @access  Private (must be a member)
const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id).populate('members.user', 'name email avatarUrl');

  if (!team) {
    res.status(404);
    throw new Error('Team not found');
  }

  const isMember = team.members.some((m) => m.user._id.equals(req.user._id));
  if (!isMember) {
    res.status(403);
    throw new Error('You are not a member of this team');
  }

  res.json({ success: true, team });
});

// @desc    Invite (add) a member to a team by email
// @route   POST /api/teams/:id/members
// @access  Private (owner only)
const inviteMember = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    res.status(400);
    throw new Error('Email is required to invite a member');
  }

  const team = await Team.findById(req.params.id);
  if (!team) {
    res.status(404);
    throw new Error('Team not found');
  }

  const requester = team.members.find((m) => m.user.equals(req.user._id));
  if (!requester || requester.role !== 'owner') {
    res.status(403);
    throw new Error('Only the team owner can invite members');
  }

  const userToInvite = await User.findOne({ email: email.toLowerCase().trim() });
  if (!userToInvite) {
    res.status(404);
    throw new Error('No user found with that email. They need to register first.');
  }

  const alreadyMember = team.members.some((m) => m.user.equals(userToInvite._id));
  if (alreadyMember) {
    res.status(400);
    throw new Error('This user is already a member of the team');
  }

  team.members.push({ user: userToInvite._id, role: 'member' });
  await team.save();

  const populatedTeam = await team.populate('members.user', 'name email avatarUrl');

  res.status(200).json({ success: true, team: populatedTeam });
});

module.exports = { createTeam, getMyTeams, getTeamById, inviteMember };
