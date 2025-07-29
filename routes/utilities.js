async function getNav(user) {
  // Build navigation links based on user authentication
  let nav = `
    <nav>
      <a href="/">Home</a>
      <a href="/auth/login">Login</a>
      <a href="/auth/register">Register</a>
      <a href="/account">Account</a>
    </nav>
  `;
  // If user is logged in, show only relevant links
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

function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  handleErrors,
  getNav,
};
