const express = require('express');
const router = express.Router();
const {
  getStaffIssues,
  acceptIssue,
  startWork,
  addProgressUpdate,
  completeWork,
} = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All staff routes require protect + staff role
router.use(protect);
router.use(authorize('staff', 'admin'));

router.get('/issues', getStaffIssues);
router.put('/issues/:id/accept', acceptIssue);
router.put('/issues/:id/start', startWork);
router.post('/issues/:id/progress', addProgressUpdate);
router.put('/issues/:id/complete', completeWork);

module.exports = router;
