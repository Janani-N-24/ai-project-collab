const Task = require('../models/Task');
const Project = require('../models/Project');
const { assertTeamMembership } = require('./projectController');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get dashboard stats (counts, progress %, chart data) for a project
// @route   GET /api/dashboard/:projectId
// @access  Private (project's team members only)
const getDashboardStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  await assertTeamMembership(project.teamId, req.user._id).catch((err) => {
    res.status(err.statusCode || 500);
    throw err;
  });

  const tasks = await Task.find({ projectId }).select('status priority');

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Done').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const pending = tasks.filter((t) => t.status === 'To Do').length;
  const progressPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const priorityBreakdown = {
    High: tasks.filter((t) => t.priority === 'High').length,
    Medium: tasks.filter((t) => t.priority === 'Medium').length,
    Low: tasks.filter((t) => t.priority === 'Low').length,
  };

  res.json({
    success: true,
    stats: {
      total,
      completed,
      inProgress,
      pending,
      progressPercentage,
      statusBreakdown: [
        { name: 'To Do', value: pending },
        { name: 'In Progress', value: inProgress },
        { name: 'Done', value: completed },
      ],
      priorityBreakdown: [
        { name: 'High', value: priorityBreakdown.High },
        { name: 'Medium', value: priorityBreakdown.Medium },
        { name: 'Low', value: priorityBreakdown.Low },
      ],
    },
  });
});

module.exports = { getDashboardStats };
