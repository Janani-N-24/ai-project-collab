// Wraps an async controller function so any rejected promise / thrown error
// is automatically forwarded to Express's error-handling middleware.
// Avoids writing try/catch in every single controller.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
