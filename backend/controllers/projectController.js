const Project = require('../models/Project');
const Team = require('../models/Team');
const asyncHandler = require('../middlewares/asyncHandler');

// Shared helper: throws if the current user isn't a member of the given team
const assertTeamMembership = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const err = new Error('Team not found');
    err.statusCode = 404;
    throw err;
  }
  const isMember = team.members.some((m) => m.user.equals(userId));
  if (!isMember) {
    const err = new Error('You are not a member of this team');
    err.statusCode = 403;
    throw err;
  }
  return team;
};

// @desc    Create a project workspace under a team
// @route   POST /api/projects
// @access  Private (team members only)
const createProject = asyncHandler(async (req, res) => {
  const { teamId, title, description } = req.body;

  if (!teamId || !title || !title.trim()) {
    res.status(400);
    throw new Error('teamId and title are required');
  }

  await assertTeamMembership(teamId, req.user._id).catch((err) => {
    res.status(err.statusCode || 500);
    throw err;
  });

  const project = await Project.create({
    teamId,
    title: title.trim(),
    description: description?.trim() || '',
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, project });
});

// @desc    Get all projects belonging to a team
// @route   GET /api/projects?teamId=<id>
// @access  Private (team members only)
const getProjectsByTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.query;

  if (!teamId) {
    res.status(400);
    throw new Error('teamId query parameter is required');
  }

  await assertTeamMembership(teamId, req.user._id).catch((err) => {
    res.status(err.statusCode || 500);
    throw err;
  });

  const projects = await Project.find({ teamId }).sort({ createdAt: -1 });

  res.json({ success: true, projects });
});

// @desc    Get a single project by id
// @route   GET /api/projects/:id
// @access  Private (team members only)
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await assertTeamMembership(project.teamId, req.user._id).catch((err) => {
    res.status(err.statusCode || 500);
    throw err;
  });

  res.json({ success: true, project });
});

module.exports = { createProject, getProjectsByTeam, getProjectById, assertTeamMembership };
