const jwt = require("jsonwebtoken");

// Error handler wrapper
function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// JWT token checker
function checkJWTToken(req, res, next) {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
}

// Login checker
function checkLogin(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  if (req.user) {
    return next();
  }
  if (res.locals.loggedin) {
    return next();
  }
  req.flash("notice", "Please log in.");
  return res.redirect("/account/login");
}

// Navigation builder
async function getNav(user) {
  let nav = `
    <nav>
      <a href="/">Home</a>
      <a href="/auth/login">Login</a>
      <a href="/auth/register">Register</a>
      <a href="/account">Account</a>
    </nav>
  `;
  if (user) {
    nav = `
      <nav>
        <a href="/">Home</a>
        <a href="/account">Account</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/auth/logout">Logout</a>
      </nav>
    `;
  }
  return nav;
}

module.exports = {
  handleErrors,
  checkJWTToken,
  checkLogin,
  getNav,
};
