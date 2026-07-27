const Task = require('../models/Task');
const Project = require('../models/Project');
const { assertTeamMembership } = require('./projectController');
const asyncHandler = require('../middlewares/asyncHandler');
const { getIO } = require('../socket');
const { uploadBufferToCloudinary } = require('../services/cloudinaryService');

// Safely broadcasts to a project's room. Wrapped in try/catch so a socket
// hiccup never breaks the underlying REST response.
const emitToProject = (projectId, event, payload) => {
  try {
    getIO().to(`project:${projectId}`).emit(event, payload);
  } catch (err) {
    console.error(`Socket emit failed (${event}):`, err.message);
  }
};

// Shared helper: loads a project and confirms the requester belongs to its team
const getAuthorizedProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }
  await assertTeamMembership(project.teamId, userId);
  return project;
};

// @desc    Create a task under a project
// @route   POST /api/tasks
// @access  Private (project's team members only)
const createTask = asyncHandler(async (req, res) => {
  const { projectId, title, description, priority, status, assignee, dueDate } = req.body;

  if (!projectId || !title || !title.trim()) {
    res.status(400);
    throw new Error('projectId and title are required');
  }

  await getAuthorizedProject(projectId, req.user._id).catch((err) => {
    res.status(err.statusCode || 500);
    throw err;
  });

  const task = await Task.create({
    projectId,
    title: title.trim(),
    description: description?.trim() || '',
    priority: priority || 'Medium',
    status: status || 'To Do',
    assignee: assignee || null,
    dueDate: dueDate || null,
    createdBy: req.user._id,
  });

  const populatedTask = await task.populate('assignee', 'name email avatarUrl');

  emitToProject(projectId, 'taskCreated', populatedTask);

  res.status(201).json({ success: true, task: populatedTask });
});

// @desc    Get all tasks for a project (used to render the Kanban board)
// @route   GET /api/tasks?projectId=<id>
// @access  Private (project's team members only)
const getTasksByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.query;

  if (!projectId) {
    res.status(400);
    throw new Error('projectId query parameter is required');
  }

  await getAuthorizedProject(projectId, req.user._id).catch((err) => {
    res.status(err.statusCode || 500);
    throw err;
  });

  const tasks = await Task.find({ projectId })
    .populate('assignee', 'name email avatarUrl')
    .sort({ createdAt: -1 });

  res.json({ success: true, tasks });
});

// @desc    Update a task (fields, status, or both — used for Kanban drag-and-drop too)
// @route   PUT /api/tasks/:id
// @access  Private (project's team members only)
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await getAuthorizedProject(task.projectId, req.user._id).catch((err) => {
    res.status(err.statusCode || 500);
    throw err;
  });

  const previousStatus = task.status;

  const allowedFields = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  await task.save();
  const populatedTask = await task.populate('assignee', 'name email avatarUrl');

  // Emit a dedicated event when the status changed (e.g. Kanban drag-and-drop)
  // so clients can animate/handle it distinctly, and a general update event otherwise.
  if (req.body.status !== undefined && req.body.status !== previousStatus) {
    emitToProject(task.projectId, 'taskStatusChanged', populatedTask);
  } else {
    emitToProject(task.projectId, 'taskUpdated', populatedTask);
  }

  res.json({ success: true, task: populatedTask });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (project's team members only)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await getAuthorizedProject(task.projectId, req.user._id).catch((err) => {
    res.status(err.statusCode || 500);
    throw err;
  });

  const { projectId } = task;
  await task.deleteOne();

  emitToProject(projectId, 'taskDeleted', { taskId: req.params.id });

  res.json({ success: true, message: 'Task deleted', taskId: req.params.id });
});

// @desc    Upload/replace a task's single attachment (image or PDF, max 5MB)
// @route   POST /api/tasks/:id/upload
// @access  Private (project's team members only)
const uploadTaskAttachment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await getAuthorizedProject(task.projectId, req.user._id).catch((err) => {
    res.status(err.statusCode || 500);
    throw err;
  });

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded. Attach one image or PDF (max 5MB).');
  }

  let result;
  try {
    result = await uploadBufferToCloudinary(req.file.buffer, {
      public_id: `task_${task._id}_${Date.now()}`,
    });
  } catch (err) {
    // Cloudinary failure shouldn't crash the server — surface a clean error instead
    res.status(502);
    throw new Error('File upload to Cloudinary failed. Please try again.');
  }

  task.fileUrl = result.secure_url;
  task.fileName = req.file.originalname;
  await task.save();

  const populatedTask = await task.populate('assignee', 'name email avatarUrl');

  emitToProject(task.projectId, 'taskUpdated', populatedTask);

  res.json({ success: true, task: populatedTask });
});

module.exports = {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  uploadTaskAttachment,
  getAuthorizedProject,
};
