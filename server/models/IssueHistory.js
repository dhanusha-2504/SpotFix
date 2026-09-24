const mongoose = require('mongoose');

const issueHistorySchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'ISSUE_CREATED',
        'STATUS_UPDATED',
        'REVIEW_APPROVED',
        'REVIEW_REJECTED',
        'PRIORITY_CHANGED',
        'STAFF_ASSIGNED',
        'STAFF_ACCEPTED',
        'WORK_STARTED',
        'PROGRESS_UPDATED',
        'WORK_COMPLETED',
        'RESOLUTION_VERIFIED',
        'ISSUE_REOPENED',
        'ISSUE_CANCELLED',
        'COMMENT_ADDED',
        'DUPLICATE_FLAGGED',
      ],
    },
    oldStatus: {
      type: String,
      default: '',
    },
    newStatus: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('IssueHistory', issueHistorySchema);
