const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    Upload single image
 * @route   POST /api/upload
 * @access  Private
 */
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file uploaded.',
    });
  }

  // Construct absolute/relative URL
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${serverUrl}/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully.',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

/**
 * @desc    Upload multiple images
 * @route   POST /api/upload/multiple
 * @access  Private
 */
router.post('/multiple', protect, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No image files uploaded.',
    });
  }

  const serverUrl = `${req.protocol}://${req.get('host')}`;
  const uploaded = req.files.map((file) => ({
    url: `${serverUrl}/uploads/${file.filename}`,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
  }));

  res.status(200).json({
    success: true,
    message: `${uploaded.length} image(s) uploaded successfully.`,
    data: uploaded,
  });
});

module.exports = router;
