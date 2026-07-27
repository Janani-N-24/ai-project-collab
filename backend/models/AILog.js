const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
    },
    // Raw response text from the LLM, stored for auditing/debugging even if
    // JSON parsing later fails
    response: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  { timestamps: true } // createdAt provided automatically
);

aiLogSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('AILog', aiLogSchema);
