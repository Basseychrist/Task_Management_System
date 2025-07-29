const express = require("express");
const router = express.Router();
const utilities = require("./utilities");
const regValidate = require("./utilities/account-validation");
const accountController = require("../controllers/accountController");
// router.post("/update", accountController.updateAccount);

/* ****************************************
 *  Deliver login view
 * *************************************** */
// async function buildLogin(req, res, next) {
//   let nav = await utilities.getNav();
//   res.render("account/login", {
//     title: "Login",
//     nav,
//     notice: req.flash("notice"), // <-- Add this line
//   });
// }

// GET /login (Deliver login view)
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// GET / (My Account main page)
router.get(
  "/",
  utilities.checkLogin, // Ensure user is logged in
  utilities.handleErrors(accountController.buildAccount)
);

// GET /register (Deliver registration view)
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// POST /register (Process registration form)
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// GET: Show update account form
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
);

// POST: Update account info
router.post(
  "/update/:account_id",
  utilities.checkLogin,
  regValidate.updateAccountRules(), // server-side validation
  regValidate.checkUpdateAccountData, // custom middleware to check email uniqueness
  utilities.handleErrors(accountController.updateAccount)
);

// POST: Change password
router.post(
  "/change-password/:account_id",
  utilities.checkLogin,
  regValidate.passwordRules(), // server-side password validation
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.changePassword)
);

// Logout route
router.get("/logout", (req, res, next) => {
  res.clearCookie("jwt");
  res.clearCookie("token");
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("info", "You have been logged out.");
    res.redirect("/");
  });
});

module.exports = router;
