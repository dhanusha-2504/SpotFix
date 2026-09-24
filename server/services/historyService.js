const IssueHistory = require('../models/IssueHistory');

/**
 * Creates an audit history record for an issue lifecycle change
 */
const recordHistory = async ({
  issueId,
  action,
  oldStatus = '',
  newStatus = '',
  performedBy,
  comment = '',
  metadata = {},
}) => {
  try {
    const history = await IssueHistory.create({
      issueId,
      action,
      oldStatus,
      newStatus,
      performedBy,
      comment,
      metadata,
    });
    return history;
  } catch (error) {
    console.error('[History Service Error]:', error.message);
    return null;
  }
};

module.exports = { recordHistory };
