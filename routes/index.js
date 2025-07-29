const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const accountController = require("../controllers/accountController");

// Redirect root to auth login for guests
router.get("/", (req, res) => {
  res.redirect("/auth/login");
});

router.get("/dashboard", ensureAuth, accountController.buildDashboard);

module.exports = router;
