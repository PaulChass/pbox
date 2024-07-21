// middleware/errorHandler.js

/**
 * Error handler middleware.
 *
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const handleError = (err,  res, next) => {
  console.error(err.stack);
};

module.exports = handleError;