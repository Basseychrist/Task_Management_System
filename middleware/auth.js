// middleware/auth.js

module.exports = {
  // Middleware to ensure user is authenticated
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/');
    }
  },

  // Middleware to ensure user is NOT authenticated (for guest-only pages like login)
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/tasks'); // Redirect to tasks dashboard if already logged in
    }
  },
};
