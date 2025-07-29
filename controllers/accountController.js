const jwt = require("jsonwebtoken");
require("dotenv").config();
const accountModel = require("../models/accountModel");
const utilities = require("../routes/utilities");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

// REMOVE or COMMENT OUT this line:
// const accountController = require("../controllers/accountController");

async function buildAccount(req, res, next) {
  try {
    const navigation = await utilities.getNav(req.user);
    res.render("account/account", {
      title: "My Account",
      navigation,
      user: req.user,
      message: req.flash("message"),
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

async function buildLogin(req, res, next) {
  const navigation = await utilities.getNav(req.user);
  res.render("auth/login", {
    title: "Login",
    navigation,
    errors: null,
    message: req.flash("message"),
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  const navigation = await utilities.getNav(req.user);
  res.render("auth/register", {
    title: "Register",
    navigation,
    errors: null,
    message: req.flash("message"),
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  const navigation = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(account_password, 10);

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword // Use hashed password here
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("auth/login", {
      title: "Login",
      navigation, // <-- use navigation
      errors: null,
      notice: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("auth/register", {
      title: "Registration",
      navigation, // <-- use navigation
      errors: null,
      notice: req.flash("notice"),
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const navigation = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  console.log("accountData:", accountData); // <-- Add this
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("auth/login", {
      title: "Login",
      navigation,
      errors: null,
      notice: req.flash("notice"),
      account_email,
    });
    return;
  }
  try {
    if (!accountData.account_password) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("auth/login", {
        title: "Login",
        navigation,
        errors: [{ msg: "Invalid credentials." }],
        notice: req.flash("notice"), // Add this line
        account_email,
      });
    }
    const passwordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    );
    console.log("Password match:", passwordMatch); // <-- Add this
    if (passwordMatch) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      req.session.user = accountData; // Add this line to store user data in session
      req.flash("info", "Login successful! Welcome back."); // Flash message for successful login
      req.session.save(() => {
        return res.redirect("/account/");
      });
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("auth/login", {
        title: "Login",
        navigation,
        errors: null,
        notice: req.flash("notice"), // Add this line
        account_email,
      });
    }
  } catch (error) {
    req.flash("notice", "An error occurred. Please try again.");
    return res.status(500).render("auth/login", {
      title: "Login",
      navigation,
      errors: [{ msg: "An error occurred. Please try again." }],
      notice: req.flash("notice"), // Add this line
      account_email,
    });
  }
}

// Deliver the update account view
// async function buildUpdateAccount(req, res, next) {
//   let nav = await utilities.getNav();
//   const user = await accountModel.getAccountById(req.params.account_id);
//   res.render("account/update-account", {
//     title: "Update Account",
//     nav,
//     user,
//     account_firstname: user.account_firstname,
//     account_lastname: user.account_lastname,
//     account_email: user.account_email,
//     errors: req.flash("error"),
//     message: req.flash("message"),
//   });
// }

// Handle account info update
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const errors = validationResult(req);
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;
  if (!errors.isEmpty()) {
    const user = await accountModel.getAccountById(account_id);
    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      user,
      account_firstname,
      account_lastname,
      account_email,
      errors: errors.array(),
      message: null,
    });
  }
  const updateResult = await accountModel.updateAccountInfo({
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  });
  if (updateResult) {
    req.session.user.account_firstname = account_firstname;
    req.session.user.account_lastname = account_lastname;
    req.session.user.account_email = account_email;
    req.flash("message", "Account updated successfully.");
  } else {
    req.flash("error", "Account update failed.");
  }
  const user = await accountModel.getAccountById(account_id);
  res.render("account/account", {
    title: "My Account",
    nav,
    message: req.flash("message"),
    info: req.flash("info"), // Always include
    notice: req.flash("notice"), // Always include
    errors: null,
    user: req.session.user,
  });
}

// Handle password change
async function changePassword(req, res, next) {
  let nav = await utilities.getNav();
  const errors = validationResult(req);
  const { account_id, account_password } = req.body;
  if (!errors.isEmpty()) {
    const user = await accountModel.getAccountById(account_id);
    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      user,
      account_firstname: user.account_firstname,
      account_lastname: user.account_lastname,
      account_email: user.account_email,
      errors: errors.array(),
      message: null,
    });
  }
  const hashedPassword = await bcrypt.hash(account_password, 10);
  const updateResult = await accountModel.updateAccountPassword(
    account_id,
    hashedPassword
  );
  if (updateResult) {
    req.flash("message", "Password updated successfully.");
  } else {
    req.flash("error", "Password update failed.");
  }
  const user = await accountModel.getAccountById(account_id);
  res.render("account/account", {
    title: "My Account",
    nav,
    message: req.flash("message"),
    info: req.flash("info"), // Add this line
    notice: req.flash("notice"), // Add this line
    errors: req.flash("error"),
  });
}

// Export the functions for use in routes
module.exports = {
  buildAccount,
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  // buildUpdateAccount,
  updateAccount, // Now this works!
  changePassword,
  buildDashboard: (req, res) => {
    // req.user is populated by Passport after Google login
    res.render("dashboard", {
      title: "Dashboard",
      user: req.user, // Contains Google credentials
    });
  },
};

async function getNav() {
  return `
    <nav>
      <a href="/">Home</a>
      <a href="/account">Account</a>
      <a href="/tasks">Tasks</a>
      <a href="/auth/login">Login</a>
      <a href="/auth/register">Register</a>
    </nav>
  `;
}
