const Issue = require('../models/Issue');
const IssueHistory = require('../models/IssueHistory');
const {
  suggestCategory,
  suggestPriority,
  detectDuplicates,
  summarizeIssueHistory,
} = require('../services/aiService');

/**
 * @desc    Get AI Category & Priority Suggestions for given issue text
 * @route   POST /api/ai/suggest
 * @access  Private
 */
const getSuggestions = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title or description for AI analysis.',
      });
    }

    const catSuggestion = suggestCategory(title, description);
    const prioSuggestion = suggestPriority(catSuggestion.category, title, description);

    res.status(200).json({
      success: true,
      data: {
        category: catSuggestion.category,
        categoryConfidence: catSuggestion.confidence,
        priority: prioSuggestion.priority,
        priorityReason: prioSuggestion.reason,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check potential duplicates for a draft issue
 * @route   POST /api/ai/check-duplicates
 * @access  Private
 */
const checkDuplicates = async (req, res, next) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude coordinates are required for geospatial duplicate detection.',
      });
    }

    // Fetch active issues in the area
    const activeIssues = await Issue.find({
      status: { $nin: ['RESOLVED', 'REJECTED', 'CANCELLED'] },
    }).select('title description category location status issueCode createdAt images');

    const duplicates = detectDuplicates(
      {
        title: title || '',
        description: description || '',
        category: category || '',
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      activeIssues
    );

    res.status(200).json({
      success: true,
      count: duplicates.length,
      data: duplicates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate AI timeline summary for an issue
 * @route   GET /api/ai/summary/:issueId
 * @access  Private
 */
const getIssueSummary = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    const histories = await IssueHistory.find({ issueId: issue._id })
      .populate('performedBy', 'name role')
      .sort({ createdAt: 1 });

    const summary = summarizeIssueHistory(issue, histories);

    res.status(200).json({
      success: true,
      data: {
        issueCode: issue.issueCode,
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuggestions,
  checkDuplicates,
  getIssueSummary,
};
