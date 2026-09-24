const Issue = require('../models/Issue');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { recordHistory } = require('../services/historyService');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get all issues assigned to the logged in staff member
 * @route   GET /api/staff/issues
 * @access  Private (Staff only)
 */
const getStaffIssues = async (req, res, next) => {
  try {
    const { status, priority, search, page = 1, limit = 15 } = req.query;

    const query = { assignedTo: req.user._id };

    if (status && status !== 'ALL') {
      if (status === 'ACTIVE') {
        query.status = { $in: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'REOPENED'] };
      } else {
        query.status = status;
      }
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { description: regex }, { issueCode: regex }];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email phone profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Summary counts for staff quick dashboard cards
    const pendingCount = await Issue.countDocuments({ assignedTo: req.user._id, status: 'ASSIGNED' });
    const inProgressCount = await Issue.countDocuments({
      assignedTo: req.user._id,
      status: { $in: ['ACCEPTED', 'IN_PROGRESS'] },
    });
    const verificationCount = await Issue.countDocuments({
      assignedTo: req.user._id,
      status: 'VERIFICATION_PENDING',
    });
    const resolvedCount = await Issue.countDocuments({
      assignedTo: req.user._id,
      status: 'RESOLVED',
    });
    const overdueCount = await Issue.countDocuments({
      assignedTo: req.user._id,
      status: { $nin: ['RESOLVED', 'REJECTED', 'CANCELLED'] },
      slaDeadline: { $lt: new Date() },
    });

    res.status(200).json({
      success: true,
      metrics: {
        total,
        pendingCount,
        inProgressCount,
        verificationCount,
        resolvedCount,
        overdueCount,
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Staff accepts assigned issue
 * @route   PUT /api/staff/issues/:id/accept
 * @access  Private (Staff only)
 */
const acceptIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findOne({ _id: req.params.id, assignedTo: req.user._id });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Assigned issue not found for this staff member.',
      });
    }

    if (issue.status !== 'ASSIGNED' && issue.status !== 'REOPENED') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept issue with current status '${issue.status}'.`,
      });
    }

    const oldStatus = issue.status;
    issue.status = 'ACCEPTED';
    await issue.save();

    await Assignment.findOneAndUpdate(
      { issueId: issue._id, staffId: req.user._id },
      { status: 'ACCEPTED', acceptedAt: new Date() }
    );

    // Record History
    await recordHistory({
      issueId: issue._id,
      action: 'STAFF_ACCEPTED',
      oldStatus,
      newStatus: 'ACCEPTED',
      performedBy: req.user._id,
      comment: `Staff member ${req.user.name} accepted the task assignment.`,
    });

    // Notify Reporter
    await createNotification({
      recipient: issue.reportedBy,
      sender: req.user._id,
      issueId: issue._id,
      title: `Staff Accepted Task: ${issue.issueCode}`,
      message: `Staff ${req.user.name} has accepted your issue and queued it for repair.`,
      type: 'WORK_STARTED',
      link: `/issues/${issue._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Issue assignment accepted successfully.',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Staff starts active work on issue
 * @route   PUT /api/staff/issues/:id/start
 * @access  Private (Staff only)
 */
const startWork = async (req, res, next) => {
  try {
    const issue = await Issue.findOne({ _id: req.params.id, assignedTo: req.user._id });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Assigned issue not found.',
      });
    }

    if (!['ACCEPTED', 'ASSIGNED', 'REOPENED'].includes(issue.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot start work from status '${issue.status}'. Must be ACCEPTED or REOPENED.`,
      });
    }

    const oldStatus = issue.status;
    issue.status = 'IN_PROGRESS';
    await issue.save();

    await Assignment.findOneAndUpdate(
      { issueId: issue._id, staffId: req.user._id },
      { status: 'IN_PROGRESS', startedAt: new Date() }
    );

    // Record History
    await recordHistory({
      issueId: issue._id,
      action: 'WORK_STARTED',
      oldStatus,
      newStatus: 'IN_PROGRESS',
      performedBy: req.user._id,
      comment: `Maintenance field work started by ${req.user.name}.`,
    });

    // Notify Reporter
    await createNotification({
      recipient: issue.reportedBy,
      sender: req.user._id,
      issueId: issue._id,
      title: `Work Started on ${issue.issueCode}`,
      message: `Staff member ${req.user.name} has started actively working on your reported issue.`,
      type: 'WORK_STARTED',
      link: `/issues/${issue._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Work status marked as IN_PROGRESS.',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Staff uploads progress update with photo
 * @route   POST /api/staff/issues/:id/progress
 * @access  Private (Staff only)
 */
const addProgressUpdate = async (req, res, next) => {
  try {
    const { notes, imageUrl } = req.body;
    const issue = await Issue.findOne({ _id: req.params.id, assignedTo: req.user._id });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Assigned issue not found.',
      });
    }

    if (imageUrl) {
      issue.images.push({
        url: imageUrl,
        type: 'PROGRESS',
        uploadedBy: req.user._id,
        caption: notes || 'Work in progress photo',
        uploadedAt: new Date(),
      });
    }

    await issue.save();

    await recordHistory({
      issueId: issue._id,
      action: 'PROGRESS_UPDATED',
      performedBy: req.user._id,
      comment: notes || 'Progress photo added by field staff',
      metadata: { imageUrl },
    });

    res.status(200).json({
      success: true,
      message: 'Progress update recorded.',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Staff completes repair work with required completion photo
 * @route   PUT /api/staff/issues/:id/complete
 * @access  Private (Staff only)
 */
const completeWork = async (req, res, next) => {
  try {
    const { completionNotes, completionImage } = req.body;

    if (!completionImage) {
      return res.status(400).json({
        success: false,
        message: 'Resolution proof photo is required to complete an issue.',
      });
    }

    const issue = await Issue.findOne({ _id: req.params.id, assignedTo: req.user._id });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Assigned issue not found.',
      });
    }

    const oldStatus = issue.status;
    issue.status = 'VERIFICATION_PENDING';

    issue.images.push({
      url: completionImage,
      type: 'AFTER',
      uploadedBy: req.user._id,
      caption: completionNotes || 'Work completed - resolution proof photo',
      uploadedAt: new Date(),
    });

    await issue.save();

    await Assignment.findOneAndUpdate(
      { issueId: issue._id, staffId: req.user._id },
      { status: 'COMPLETED', completedAt: new Date() }
    );

    // Record History
    await recordHistory({
      issueId: issue._id,
      action: 'WORK_COMPLETED',
      oldStatus,
      newStatus: 'VERIFICATION_PENDING',
      performedBy: req.user._id,
      comment: `Staff completed work. Notes: "${completionNotes || 'Fix completed'}". Awaiting citizen/admin verification.`,
      metadata: { completionImage },
    });

    // Notify Reporter to verify
    await createNotification({
      recipient: issue.reportedBy,
      sender: req.user._id,
      issueId: issue._id,
      title: `Resolution Verification Needed: ${issue.issueCode}`,
      message: `Staff marked "${issue.title}" as resolved. Please review the after photo and confirm or reopen.`,
      type: 'VERIFICATION_REQUESTED',
      link: `/issues/${issue._id}`,
    });

    // Notify Admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: req.user._id,
        issueId: issue._id,
        title: `Work Completed on ${issue.issueCode}`,
        message: `Staff ${req.user.name} completed work on "${issue.title}".`,
        type: 'WORK_COMPLETED',
        link: `/admin/issues/${issue._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Work marked as completed. Issue moved to VERIFICATION_PENDING.',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffIssues,
  acceptIssue,
  startWork,
  addProgressUpdate,
  completeWork,
};
