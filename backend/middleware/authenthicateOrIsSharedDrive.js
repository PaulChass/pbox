const authenticate = require('./auth');
const isSharedDrive = require('./isSharedDrive.js');

/**
 * Middleware function to authenticate the user or check for shared drive access.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */

const authenticateOrIsSharedDrive = (req, res, next) => {
  const folderId = req.params.folderId; // Extract folderId from request parameters
  const fileId = req.params.fileId; // Extract fileId from request parameters
  // Check if the user is authenticated
  const token = req.params.token;
  authenticate(req, res, (authErr) => {
    if (!authErr) {
      return next(); // User is authenticated
    }

    console.log('You are not authenticated');
    // If not authenticated, check for shared drive access
    isSharedDrive(req, res, folderId,fileId, isSharedDriveErr => {
      if (!isSharedDriveErr) {
        return next();
      }
      return res.status(403).json({ error: 'You do not have access to this dadadafolder' });
    }
    );
  });

}

module.exports = authenticateOrIsSharedDrive;
