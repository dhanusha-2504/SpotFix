const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  getStaffList,
  updateUser,
  reviewIssue,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require protect + admin role
router.use(protect);

// Staff list is accessible by admin & staff for assignments
router.get('/staff', authorize('admin', 'staff'), getStaffList);

router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.put('/issues/:id/review', reviewIssue);

module.exports = router;
