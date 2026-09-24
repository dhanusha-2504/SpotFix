const Issue = require('../models/Issue');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const { recordHistory } = require('../services/historyService');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get comprehensive Admin Dashboard stats and charts data
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const openIssues = await Issue.countDocuments({
      status: { $in: ['REPORTED', 'UNDER_REVIEW', 'APPROVED', 'ASSIGNED'] },
    });
    const inProgressIssues = await Issue.countDocuments({
      status: { $in: ['ACCEPTED', 'IN_PROGRESS'] },
    });
    const verificationPendingIssues = await Issue.countDocuments({
      status: 'VERIFICATION_PENDING',
    });
    const resolvedIssues = await Issue.countDocuments({ status: 'RESOLVED' });
    const reopenedIssues = await Issue.countDocuments({ status: 'REOPENED' });
    const rejectedIssues = await Issue.countDocuments({ status: 'REJECTED' });

    // Overdue issues (SLA deadline passed and not resolved/rejected/cancelled)
    const overdueIssues = await Issue.countDocuments({
      status: { $nin: ['RESOLVED', 'REJECTED', 'CANCELLED'] },
      slaDeadline: { $lt: new Date() },
    });

    // Breakdown by Category
    const categoryStats = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Breakdown by Priority
    const priorityStats = await Issue.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Breakdown by Status
    const statusStats = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Issues over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const issuesOverTime = await Issue.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Average resolution time (in hours)
    const resolvedData = await Issue.find({
      status: 'RESOLVED',
      resolvedAt: { $exists: true, $ne: null },
    }).select('createdAt resolvedAt');

    let avgResolutionHours = 0;
    if (resolvedData.length > 0) {
      const totalHours = resolvedData.reduce((acc, curr) => {
        const diffMs = new Date(curr.resolvedAt) - new Date(curr.createdAt);
        return acc + diffMs / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Number((totalHours / resolvedData.length).toFixed(1));
    }

    // Staff Workload
    const staffMembers = await User.find({ role: 'staff' }).select('name email department phone');
    const staffWorkload = await Promise.all(
      staffMembers.map(async (staff) => {
        const assigned = await Issue.countDocuments({ assignedTo: staff._id, status: 'ASSIGNED' });
        const inProgress = await Issue.countDocuments({
          assignedTo: staff._id,
          status: { $in: ['ACCEPTED', 'IN_PROGRESS'] },
        });
        const completed = await Issue.countDocuments({
          assignedTo: staff._id,
          status: { $in: ['VERIFICATION_PENDING', 'RESOLVED'] },
        });
        return {
          id: staff._id,
          name: staff.name,
          email: staff.email,
          department: staff.department,
          assigned,
          inProgress,
          completed,
          total: assigned + inProgress + completed,
        };
      })
    );

    // Recent 5 issues
    const recentIssues = await Issue.find()
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name department')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIssues,
          openIssues,
          inProgressIssues,
          verificationPendingIssues,
          resolvedIssues,
          reopenedIssues,
          rejectedIssues,
          overdueIssues,
          avgResolutionHours,
        },
        categoryStats,
        priorityStats,
        statusStats,
        issuesOverTime,
        staffWorkload,
        recentIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with filtering
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'ALL') {
      query.role = role;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { department: regex }];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all staff members for assignment dropdowns
 * @route   GET /api/admin/staff
 * @access  Private (Admin/Staff)
 */
const getStaffList = async (req, res, next) => {
  try {
    const staff = await User.find({ role: 'staff', isActive: true })
      .select('name email phone department profileImage')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role or active status
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin only)
 */
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, department, name, phone } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (role && ['user', 'admin', 'staff'].includes(role)) {
      user.role = role;
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    if (department) {
      user.department = department;
    }
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin review issue (Approve/Reject & set official priority)
 * @route   PUT /api/admin/issues/:id/review
 * @access  Private (Admin only)
 */
const reviewIssue = async (req, res, next) => {
  try {
    const { decision, priority, adminComment } = req.body; // decision: 'APPROVE' | 'REJECT' | 'UNDER_REVIEW'
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    const oldStatus = issue.status;
    let newStatus;

    if (decision === 'APPROVE') {
      newStatus = 'APPROVED';
    } else if (decision === 'REJECT') {
      newStatus = 'REJECTED';
      issue.rejectionReason = adminComment || 'Rejected by administrator';
    } else {
      newStatus = 'UNDER_REVIEW';
    }

    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
      issue.priority = priority;
    }

    issue.status = newStatus;
    await issue.save();

    // Record audit history
    await recordHistory({
      issueId: issue._id,
      action: decision === 'APPROVE' ? 'REVIEW_APPROVED' : decision === 'REJECT' ? 'REVIEW_REJECTED' : 'STATUS_UPDATED',
      oldStatus,
      newStatus,
      performedBy: req.user._id,
      comment: adminComment || `Admin reviewed issue: ${newStatus}. Official priority: ${issue.priority}`,
      metadata: { priority: issue.priority, decision },
    });

    // Notify Reporter
    await createNotification({
      recipient: issue.reportedBy,
      sender: req.user._id,
      issueId: issue._id,
      title: `Issue Review Update: ${issue.issueCode}`,
      message:
        newStatus === 'APPROVED'
          ? `Your issue has been approved and marked as ${issue.priority} priority.`
          : `Your issue was reviewed and marked as ${newStatus}.`,
      type: newStatus === 'APPROVED' ? 'ISSUE_APPROVED' : 'ISSUE_REJECTED',
      link: `/issues/${issue._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Issue review complete: ${newStatus}`,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getStaffList,
  updateUser,
  reviewIssue,
};
