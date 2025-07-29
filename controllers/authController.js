// This controller mainly handles redirects after OAuth
exports.googleAuth = (req, res) => {
  // Passport handles the Google authentication logic here
};

exports.googleCallback = (req, res) => {
  // User is already created/updated by Passport GoogleStrategy
  // Redirect to dashboard
  res.redirect("/dashboard");
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect("/auth/login");
  });
};
