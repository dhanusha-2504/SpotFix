const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'ISSUE_SUBMITTED',
        'ISSUE_APPROVED',
        'ISSUE_REJECTED',
        'STAFF_ASSIGNED',
        'WORK_STARTED',
        'WORK_COMPLETED',
        'VERIFICATION_REQUESTED',
        'ISSUE_RESOLVED',
        'ISSUE_REOPENED',
        'COMMENT_RECEIVED',
        'SYSTEM_ALERT',
      ],
      default: 'SYSTEM_ALERT',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
