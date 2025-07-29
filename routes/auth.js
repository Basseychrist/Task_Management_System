const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");

// Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  authController.googleCallback // Handles user creation and redirect
);

// Logout
router.get("/logout", authController.logout);

// Show login page
router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login" });
});

// Show register page (optional, can redirect to login)
router.get("/register", (req, res) => {
  res.redirect("/auth/login");
});

module.exports = router;
