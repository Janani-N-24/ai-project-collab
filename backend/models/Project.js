const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true } // provides createdAt / updatedAt
);

projectSchema.index({ teamId: 1 });

module.exports = mongoose.model('Project', projectSchema);
