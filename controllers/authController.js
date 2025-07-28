// This controller mainly handles redirects after OAuth
exports.googleAuth = (req, res) => {
  // Passport handles the Google authentication logic here
};

exports.googleAuthCallback = (req, res) => {
  res.redirect('/tasks'); // Redirect to tasks dashboard after successful login
};

exports.logout = (req, res, next) => {
  req.logout((err) => { // Passport's req.logout() requires a callback since v0.6.0
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'You have been logged out.'); // Add flash message
    res.redirect('/');
  });
};

