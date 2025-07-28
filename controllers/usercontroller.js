const User = require('../models/user');

// Helper function for error handling
const handleError = (res, error, message = 'Server Error', statusCode = 500) => {
  console.error(error);
  res.status(statusCode).render('error', {
    message: message,
    status: statusCode,
    error: error.message,
    title: 'Error'
  });
};

// @desc    Get user profile
// @route   GET /users/:id
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      return handleError(res, new Error('User not found'), 'User not found', 404);
    }

    // Only allow viewing of own profile for now
    if (user._id.toString() !== req.user.id) {
      return handleError(res, new Error('Not authorized'), 'You are not authorized to view this profile', 403);
    }

    res.render('users/profile', {
      user,
      title: `${user.displayName}'s Profile` // Pass title
    });
  } catch (err) {
    handleError(res, err, 'Failed to fetch user profile', 500);
  }
};
