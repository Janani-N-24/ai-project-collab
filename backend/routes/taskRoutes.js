const express = require('express');
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  uploadTaskAttachment,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').post(createTask).get(getTasksByProject);
router.route('/:id').put(updateTask).delete(deleteTask);

// Wrap Multer so file-too-large / invalid-type errors return a clean JSON
// response instead of an unhandled exception.
router.post(
  '/:id/upload',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File exceeds the 5MB limit' });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadTaskAttachment
);

module.exports = router;
