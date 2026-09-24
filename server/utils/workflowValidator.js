/**
 * SPOTFIX Workflow State Machine
 * Strictly governs permissible status transitions to prevent illegal jumps.
 */

const VALID_TRANSITIONS = {
  REPORTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['ASSIGNED', 'UNDER_REVIEW', 'CANCELLED'],
  ASSIGNED: ['ACCEPTED', 'APPROVED', 'CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'ASSIGNED'],
  IN_PROGRESS: ['COMPLETED', 'ACCEPTED'],
  COMPLETED: ['VERIFICATION_PENDING'],
  VERIFICATION_PENDING: ['RESOLVED', 'REOPENED'],
  RESOLVED: ['REOPENED'],
  REOPENED: ['UNDER_REVIEW', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS'],
  REJECTED: ['UNDER_REVIEW'],
  CANCELLED: [],
};

/**
 * Validates whether transition from currentStatus to nextStatus is allowed
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {boolean}
 */
const isValidTransition = (currentStatus, nextStatus) => {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true; // Idempotent updates

  const allowedNext = VALID_TRANSITIONS[currentStatus];
  if (!allowedNext) return false;

  return allowedNext.includes(nextStatus);
};

/**
 * Returns permissible next actions for a given role and current status
 */
const getAllowedNextStates = (currentStatus, role = 'user') => {
  const allAllowed = VALID_TRANSITIONS[currentStatus] || [];
  
  if (role === 'admin') {
    return allAllowed;
  }
  
  if (role === 'staff') {
    // Staff can accept, start, complete
    const staffAllowed = ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
    return allAllowed.filter((s) => staffAllowed.includes(s));
  }
  
  if (role === 'user') {
    // User can cancel reported issue, verify/resolve or reopen
    const userAllowed = ['CANCELLED', 'RESOLVED', 'REOPENED'];
    return allAllowed.filter((s) => userAllowed.includes(s));
  }
  
  return [];
};

module.exports = {
  VALID_TRANSITIONS,
  isValidTransition,
  getAllowedNextStates,
};
