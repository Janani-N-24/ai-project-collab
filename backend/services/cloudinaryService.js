const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

// Uploads a Multer in-memory file buffer to Cloudinary and resolves with the result
// (we only need secure_url + original_filename, but return the whole object for flexibility).
// resource_type: 'auto' lets Cloudinary correctly handle both images and PDFs.
const uploadBufferToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'ai-project-collab/tasks', ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

module.exports = { uploadBufferToCloudinary };
