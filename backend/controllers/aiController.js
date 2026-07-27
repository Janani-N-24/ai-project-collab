const Project = require('../models/Project');
const AILog = require('../models/AILog');
const { assertTeamMembership } = require('./projectController');
const asyncHandler = require('../middlewares/asyncHandler');
const { generateTasksFromDescription } = require('../services/aiService');

// @desc    Generate a structured task breakdown from a project description (AI Task Assistant)
// @route   POST /api/projects/:id/ai-breakdown
// @access  Private (project's team members only)
// @note    This is the ONLY AI feature in the app — it returns suggested tasks for the user
//          to review/edit/delete in the UI before anything is saved to MongoDB.
const generateTaskBreakdown = asyncHandler(async (req, res) => {
  const { description } = req.body;
  const projectId = req.params.id;

  if (!description || !description.trim()) {
    res.status(400);
    throw new Error('A project description is required to generate tasks');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  await assertTeamMembership(project.teamId, req.user._id).catch((err) => {
    res.status(err.statusCode || 500);
    throw err;
  });

  try {
    const { tasks, rawText } = await generateTasksFromDescription(description.trim());

    // Audit trail: every AI call is logged, success or failure
    await AILog.create({
      projectId,
      requestedBy: req.user._id,
      prompt: description.trim(),
      response: rawText,
      status: 'success',
    });

    res.json({ success: true, tasks });
  } catch (err) {
    await AILog.create({
      projectId,
      requestedBy: req.user._id,
      prompt: description.trim(),
      response: err.message,
      status: 'failed',
    });

    // Never crash the server on an AI failure — surface a clean, user-facing error
    res.status(502);
    throw new Error(
      'AI Task Assistant is temporarily unavailable. Please try again, or add tasks manually.'
    );
  }
});

module.exports = { generateTaskBreakdown };
