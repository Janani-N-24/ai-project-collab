const multer = require('multer');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB, per project spec

// Memory storage: we stream the buffer straight to Cloudinary rather than
// writing it to disk first (simpler cleanup, no orphaned temp files).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only images (jpg, png, gif, webp) and PDF files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = upload;
