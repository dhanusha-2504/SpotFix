const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['BEFORE', 'PROGRESS', 'AFTER'],
      default: 'BEFORE',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    caption: {
      type: String,
      default: '',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const issueSchema = new mongoose.Schema(
  {
    issueCode: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed issue description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please specify an issue category'],
      enum: [
        'Pothole',
        'Streetlight',
        'Garbage',
        'Water Leakage',
        'Drainage',
        'Footpath',
        'Road Damage',
        'Public Facility',
        'Other',
      ],
      default: 'Other',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    userSuggestedPriority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    aiSuggestedCategory: {
      type: String,
      default: '',
    },
    aiSuggestedPriority: {
      type: String,
      default: '',
    },
    aiConfidence: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'REPORTED',
        'UNDER_REVIEW',
        'APPROVED',
        'ASSIGNED',
        'ACCEPTED',
        'IN_PROGRESS',
        'COMPLETED',
        'VERIFICATION_PENDING',
        'RESOLVED',
        'REJECTED',
        'REOPENED',
        'CANCELLED',
      ],
      default: 'REPORTED',
      index: true,
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Location latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Location longitude is required'],
      },
      address: {
        type: String,
        default: 'Location coordinates pinned on map',
      },
      landmark: {
        type: String,
        default: '',
      },
    },
    images: [imageSchema],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignmentNotes: {
      type: String,
      default: '',
    },
    reopenReason: {
      type: String,
      default: '',
    },
    reopenedCount: {
      type: Number,
      default: 0,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
    slaHours: {
      type: Number,
      default: 48,
    },
    slaDeadline: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate Issue Code SP-XXXX
issueSchema.pre('save', async function (next) {
  if (!this.issueCode) {
    const count = await mongoose.model('Issue').countDocuments();
    const sequence = 1000 + count + 1;
    this.issueCode = `SP-${sequence}`;
  }
  if (!this.slaDeadline && this.isNew) {
    const hours = this.slaHours || 48;
    this.slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  next();
});

// Create text index for search
issueSchema.index({ title: 'text', description: 'text', issueCode: 'text' });
// Geo index on location
issueSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('Issue', issueSchema);
