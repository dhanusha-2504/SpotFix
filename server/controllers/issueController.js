const Issue = require('../models/Issue');
const IssueHistory = require('../models/IssueHistory');
const Comment = require('../models/Comment');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { isValidTransition } = require('../utils/workflowValidator');
const { suggestCategory, suggestPriority, detectDuplicates } = require('../services/aiService');
const { createNotification } = require('../services/notificationService');
const { recordHistory } = require('../services/historyService');

/**
 * @desc    Create a new issue
 * @route   POST /api/issues
 * @access  Private (User/Admin/Staff)
 */
const createIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      userSuggestedPriority = 'MEDIUM',
      latitude,
      longitude,
      address,
      landmark,
      images = [],
      isDuplicateConfirmed = false,
      duplicateOf = null,
    } = req.body;

    if (!title || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and valid map coordinates (latitude & longitude).',
      });
    }

    // AI Suggestions
    const aiCat = suggestCategory(title, description);
    const selectedCategory = category || aiCat.category || 'Other';
    const aiPrio = suggestPriority(selectedCategory, title, description);

    // AI Duplicate Detection check (if not pre-confirmed)
    if (!isDuplicateConfirmed) {
      const recentIssues = await Issue.find({
        status: { $nin: ['RESOLVED', 'REJECTED', 'CANCELLED'] },
      }).select('title description category location status issueCode createdAt');

      const duplicates = detectDuplicates(
        {
          title,
          description,
          category: selectedCategory,
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        recentIssues
      );

      // If high confidence duplicates exist and user hasn't explicitly clicked "Submit Anyway"
      if (duplicates.length > 0 && req.query.checkDuplicates === 'true') {
        return res.status(200).json({
          success: true,
          hasPotentialDuplicates: true,
          duplicates,
          message: 'Potential duplicate issues detected nearby.',
        });
      }
    }

    // Prepare formatted images array
    const formattedImages = images.map((img) => ({
      url: typeof img === 'string' ? img : img.url,
      type: (img.type || 'BEFORE').toUpperCase(),
      uploadedBy: req.user._id,
      caption: img.caption || 'Initial report photo',
      uploadedAt: new Date(),
    }));

    // Create Issue
    const issue = await Issue.create({
      title,
      description,
      category: selectedCategory,
      priority: aiPrio.priority, // Default initial priority guided by AI/Admin
      userSuggestedPriority,
      aiSuggestedCategory: aiCat.category,
      aiSuggestedPriority: aiPrio.priority,
      aiConfidence: aiCat.confidence,
      status: 'REPORTED',
      reportedBy: req.user._id,
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        address: address || 'Pinned location on map',
        landmark: landmark || '',
      },
      images: formattedImages,
      isDuplicate: !!duplicateOf,
      duplicateOf: duplicateOf || null,
    });

    // Record History
    await recordHistory({
      issueId: issue._id,
      action: 'ISSUE_CREATED',
      newStatus: 'REPORTED',
      performedBy: req.user._id,
      comment: `Issue reported by ${req.user.name}. Category: ${issue.category}, Suggested Priority: ${userSuggestedPriority}`,
      metadata: { aiSuggestedCategory: aiCat.category, aiSuggestedPriority: aiPrio.priority },
    });

    // Notify Admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: req.user._id,
        issueId: issue._id,
        title: `New Issue Reported: ${issue.issueCode}`,
        message: `${req.user.name} reported "${issue.title}" in ${issue.category}.`,
        type: 'ISSUE_SUBMITTED',
        link: `/admin/issues/${issue._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully.',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all issues with search, filtering, sorting, pagination
 * @route   GET /api/issues
 * @access  Private
 */
const getIssues = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      priority,
      reportedBy,
      assignedTo,
      sortBy = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Role-based restrictions: Users default to seeing their own issues or all public issues
    if (req.user.role === 'user' && req.query.myIssues === 'true') {
      query.reportedBy = req.user._id;
    } else if (req.user.role === 'staff' && req.query.assignedToMe === 'true') {
      query.assignedTo = req.user._id;
    }

    if (reportedBy) {
      query.reportedBy = reportedBy;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Category filter
    if (category && category !== 'ALL') {
      query.category = category;
    }

    // Status filter
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Priority filter
    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    // Search filter (title, description, issueCode)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { issueCode: searchRegex },
        { 'location.address': searchRegex },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'priority') {
      // Custom mapping for critical to low
      sortOptions = { priority: 1, createdAt: -1 };
    } else if (sortBy === 'status') {
      sortOptions = { status: 1, createdAt: -1 };
    } else if (sortBy === 'updated') {
      sortOptions = { updatedAt: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email phone profileImage')
      .populate('assignedTo', 'name email department phone profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: issues.length,
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
 * @desc    Get single issue details with history and comments
 * @route   GET /api/issues/:id
 * @access  Private
 */
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email phone profileImage')
      .populate('assignedTo', 'name email department phone profileImage')
      .populate('duplicateOf', 'issueCode title status');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    // Fetch history audit trail
    const history = await IssueHistory.find({ issueId: issue._id })
      .populate('performedBy', 'name role email')
      .sort({ createdAt: 1 });

    // Fetch comments
    const commentQuery = { issueId: issue._id };
    // Non-staff and non-admin cannot see internal comments
    if (req.user.role === 'user') {
      commentQuery.isInternal = false;
    }

    const comments = await Comment.find(commentQuery)
      .populate('user', 'name role email profileImage')
      .sort({ createdAt: 1 });

    // Fetch assignment details if any
    const assignment = await Assignment.findOne({ issueId: issue._id })
      .populate('staffId', 'name email department phone')
      .populate('assignedBy', 'name email');

    res.status(200).json({
      success: true,
      data: {
        issue,
        history,
        comments,
        assignment,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update issue status with strict workflow validation
 * @route   PUT /api/issues/:id/status
 * @access  Private
 */
const updateIssueStatus = async (req, res, next) => {
  try {
    const { status: nextStatus, comment, resolutionImage } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    const currentStatus = issue.status;

    // Check transition validity
    if (!isValidTransition(currentStatus, nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${nextStatus}'. Permitted workflow transitions must be followed.`,
      });
    }

    // Role-based status authorization check
    if (req.user.role === 'user') {
      if (issue.reportedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update status on your own reported issues.',
        });
      }
      if (!['CANCELLED', 'RESOLVED', 'REOPENED'].includes(nextStatus)) {
        return res.status(403).json({
          success: false,
          message: 'Users can only cancel, confirm resolution, or reopen issues.',
        });
      }
    }

    if (req.user.role === 'staff') {
      if (!issue.assignedTo || issue.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update issues assigned to you.',
        });
      }
      if (!['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(nextStatus)) {
        return res.status(403).json({
          success: false,
          message: 'Staff members can only mark assigned issues as ACCEPTED, IN_PROGRESS, or COMPLETED.',
        });
      }
    }

    // If staff completes work, transition directly to VERIFICATION_PENDING and require proof
    let finalStatus = nextStatus;
    if (nextStatus === 'COMPLETED') {
      finalStatus = 'VERIFICATION_PENDING';
      if (resolutionImage) {
        issue.images.push({
          url: resolutionImage,
          type: 'AFTER',
          uploadedBy: req.user._id,
          caption: 'Resolution proof / After photo',
          uploadedAt: new Date(),
        });
      }
    }

    if (finalStatus === 'RESOLVED') {
      issue.resolvedAt = new Date();
    }

    issue.status = finalStatus;
    await issue.save();

    // Record in history audit
    await recordHistory({
      issueId: issue._id,
      action: 'STATUS_UPDATED',
      oldStatus: currentStatus,
      newStatus: finalStatus,
      performedBy: req.user._id,
      comment: comment || `Status changed to ${finalStatus}`,
    });

    // Notify Reporter
    if (issue.reportedBy.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: issue.reportedBy,
        sender: req.user._id,
        issueId: issue._id,
        title: `Issue ${issue.issueCode} Status Update`,
        message: `Your issue is now: ${finalStatus}.`,
        type: finalStatus === 'VERIFICATION_PENDING' ? 'VERIFICATION_REQUESTED' : 'SYSTEM_ALERT',
        link: `/issues/${issue._id}`,
      });
    }

    // Notify Staff if updated by Admin
    if (issue.assignedTo && issue.assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: issue.assignedTo,
        sender: req.user._id,
        issueId: issue._id,
        title: `Assigned Issue ${issue.issueCode} Updated`,
        message: `Status transitioned to ${finalStatus}.`,
        type: 'SYSTEM_ALERT',
        link: `/staff/issues/${issue._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Issue status updated from ${currentStatus} to ${finalStatus}.`,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign staff member to an issue
 * @route   PUT /api/issues/:id/assign
 * @access  Private (Admin only)
 */
const assignStaff = async (req, res, next) => {
  try {
    const { staffId, notes, priority } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    const staff = await User.findOne({ _id: staffId, role: 'staff' });
    if (!staff) {
      return res.status(400).json({
        success: false,
        message: 'Selected staff member does not exist or is not registered as staff.',
      });
    }

    const oldStatus = issue.status;
    issue.assignedTo = staff._id;
    issue.assignmentNotes = notes || '';
    if (priority) issue.priority = priority;
    issue.status = 'ASSIGNED';
    await issue.save();

    // Create or update Assignment document
    let assignment = await Assignment.findOne({ issueId: issue._id });
    if (assignment) {
      assignment.staffId = staff._id;
      assignment.assignedBy = req.user._id;
      assignment.notes = notes || '';
      assignment.priority = issue.priority;
      assignment.status = 'PENDING';
      assignment.assignedAt = new Date();
      await assignment.save();
    } else {
      assignment = await Assignment.create({
        issueId: issue._id,
        staffId: staff._id,
        assignedBy: req.user._id,
        notes: notes || '',
        priority: issue.priority,
        status: 'PENDING',
      });
    }

    // Record History
    await recordHistory({
      issueId: issue._id,
      action: 'STAFF_ASSIGNED',
      oldStatus,
      newStatus: 'ASSIGNED',
      performedBy: req.user._id,
      comment: `Assigned to staff ${staff.name} (${staff.department}). Notes: ${notes || 'None'}`,
      metadata: { staffId: staff._id, staffName: staff.name },
    });

    // Notify Staff
    await createNotification({
      recipient: staff._id,
      sender: req.user._id,
      issueId: issue._id,
      title: `New Task Assignment: ${issue.issueCode}`,
      message: `You have been assigned to resolve "${issue.title}". Priority: ${issue.priority}.`,
      type: 'STAFF_ASSIGNED',
      link: `/staff/issues/${issue._id}`,
    });

    // Notify Reporter
    await createNotification({
      recipient: issue.reportedBy,
      sender: req.user._id,
      issueId: issue._id,
      title: `Staff Assigned to ${issue.issueCode}`,
      message: `Your issue has been assigned to ${staff.name} (${staff.department}).`,
      type: 'STAFF_ASSIGNED',
      link: `/issues/${issue._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Issue assigned to ${staff.name} successfully.`,
      data: { issue, assignment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify issue resolution (User or Admin)
 * @route   POST /api/issues/:id/verify
 * @access  Private (User or Admin)
 */
const verifyResolution = async (req, res, next) => {
  try {
    const { satisfactionScore, feedback } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    if (!['VERIFICATION_PENDING', 'COMPLETED'].includes(issue.status)) {
      return res.status(400).json({
        success: false,
        message: `Issue cannot be verified in current status '${issue.status}'. It must be in VERIFICATION_PENDING.`,
      });
    }

    const oldStatus = issue.status;
    issue.status = 'RESOLVED';
    issue.resolvedAt = new Date();
    await issue.save();

    // Record history
    await recordHistory({
      issueId: issue._id,
      action: 'RESOLUTION_VERIFIED',
      oldStatus,
      newStatus: 'RESOLVED',
      performedBy: req.user._id,
      comment: `Resolution verified & confirmed by ${req.user.name}. ${feedback ? `Feedback: "${feedback}"` : ''}`,
      metadata: { satisfactionScore, feedback },
    });

    // Notify assigned staff
    if (issue.assignedTo) {
      await createNotification({
        recipient: issue.assignedTo,
        sender: req.user._id,
        issueId: issue._id,
        title: `Resolution Confirmed: ${issue.issueCode}`,
        message: `The resolution for "${issue.title}" was verified and closed!`,
        type: 'ISSUE_RESOLVED',
        link: `/staff/issues/${issue._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Issue resolution verified and successfully marked as RESOLVED.',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reopen an unresolved issue
 * @route   POST /api/issues/:id/reopen
 * @access  Private (User or Admin)
 */
const reopenIssue = async (req, res, next) => {
  try {
    const { reason, reopenImage } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A clear reason is required to reopen an issue.',
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    if (!['VERIFICATION_PENDING', 'COMPLETED', 'RESOLVED'].includes(issue.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reopen an issue with status '${issue.status}'.`,
      });
    }

    const oldStatus = issue.status;
    issue.status = 'REOPENED';
    issue.reopenReason = reason;
    issue.reopenedCount = (issue.reopenedCount || 0) + 1;
    issue.resolvedAt = null;

    if (reopenImage) {
      issue.images.push({
        url: reopenImage,
        type: 'BEFORE',
        uploadedBy: req.user._id,
        caption: `Reopen evidence: ${reason}`,
        uploadedAt: new Date(),
      });
    }

    await issue.save();

    // Record history
    await recordHistory({
      issueId: issue._id,
      action: 'ISSUE_REOPENED',
      oldStatus,
      newStatus: 'REOPENED',
      performedBy: req.user._id,
      comment: `Issue reopened by ${req.user.name}. Reason: "${reason}"`,
      metadata: { reason },
    });

    // Notify Admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: req.user._id,
        issueId: issue._id,
        title: `Issue Reopened: ${issue.issueCode}`,
        message: `${req.user.name} reopened "${issue.title}". Reason: ${reason}`,
        type: 'ISSUE_REOPENED',
        link: `/admin/issues/${issue._id}`,
      });
    }

    // Notify Staff if previously assigned
    if (issue.assignedTo) {
      await createNotification({
        recipient: issue.assignedTo,
        sender: req.user._id,
        issueId: issue._id,
        title: `Issue Reopened: ${issue.issueCode}`,
        message: `Issue "${issue.title}" was rejected during verification: ${reason}`,
        type: 'ISSUE_REOPENED',
        link: `/staff/issues/${issue._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Issue has been reopened for further investigation.',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add comment to an issue
 * @route   POST /api/issues/:id/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { text, isInternal = false, attachments = [] } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.',
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    // Only Admin & Staff can post internal comments
    const canMakeInternal = ['admin', 'staff'].includes(req.user.role);
    const commentIsInternal = canMakeInternal ? !!isInternal : false;

    const comment = await Comment.create({
      issueId: issue._id,
      user: req.user._id,
      text,
      isInternal: commentIsInternal,
      attachments,
    });

    await comment.populate('user', 'name role email profileImage');

    // Record history
    await recordHistory({
      issueId: issue._id,
      action: 'COMMENT_ADDED',
      performedBy: req.user._id,
      comment: `${req.user.name} added a ${commentIsInternal ? 'internal note' : 'comment'}: "${text.slice(0, 60)}..."`,
      metadata: { isInternal: commentIsInternal },
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  assignStaff,
  verifyResolution,
  reopenIssue,
  addComment,
};
