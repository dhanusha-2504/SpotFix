const express = require('express');
const router = express.Router();
const {
  getSuggestions,
  checkDuplicates,
  getIssueSummary,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/suggest', getSuggestions);
router.post('/check-duplicates', checkDuplicates);
router.get('/summary/:issueId', getIssueSummary);

module.exports = router;
