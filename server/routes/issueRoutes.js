const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  assignStaff,
  verifyResolution,
  reopenIssue,
  addComment,
} = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All issue routes require authentication
router.use(protect);

router.route('/')
  .post(createIssue)
  .get(getIssues);

router.route('/:id')
  .get(getIssueById);

router.route('/:id/status')
  .put(updateIssueStatus);

router.route('/:id/assign')
  .put(authorize('admin'), assignStaff);

router.route('/:id/verify')
  .post(authorize('user', 'admin'), verifyResolution);

router.route('/:id/reopen')
  .post(authorize('user', 'admin'), reopenIssue);

router.route('/:id/comments')
  .post(addComment);

module.exports = router;
