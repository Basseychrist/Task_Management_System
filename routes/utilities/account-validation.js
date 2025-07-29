const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../../models/accountModel");

const validate = {}; /*  **********************************
 
  
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // email is required and must be valid
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),

    // password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

const updateAccountRules = () => [
  body("account_firstname")
    .trim()
    .notEmpty()
    .withMessage("First name is required."),
  body("account_lastname")
    .trim()
    .notEmpty()
    .withMessage("Last name is required."),
  body("account_email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required.")
    .normalizeEmail(),
];

const checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req);
  if (req.body.account_email !== req.session.user.account_email) {
    const existing = await accountModel.getAccountByEmail(
      req.body.account_email
    );
    if (existing) {
      errors.errors.push({ msg: "Email already exists." });
    }
  }
  if (!errors.isEmpty()) {
    req.flash(
      "error",
      errors.array().map((e) => e.msg)
    );
    let nav = await utilities.getNav(); // <-- Add this line
    return res.render("account/update-account", {
      title: "Update Account",
      user: req.session.user,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
      errors: errors.array(),
      message: [],
      nav, // <-- Add this line
    });
  }
  next();
};

const passwordRules = () => [
  body("account_password")
    .trim()
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter.")
    .matches(/\d/)
    .withMessage("Password must contain a number.")
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain a special character."),
];

const checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      "error",
      errors.array().map((e) => e.msg)
    );
    let nav = await utilities.getNav(); // <-- Add this line
    return res.render("account/update-account", {
      title: "Update Account",
      user: req.session.user,
      errors: errors.array(),
      message: [],
      nav, // <-- Add this line
    });
  }
  next();
};

//export default validate and loginRules
module.exports = {
  loginRules: validate.loginRules,
  registationRules: validate.registationRules,
  checkRegData: validate.checkRegData,
  checkLoginData: validate.checkLoginData,
  updateAccountRules,
  checkUpdateAccountData,
  passwordRules,
  checkPasswordData,
};
