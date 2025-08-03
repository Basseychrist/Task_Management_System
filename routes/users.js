const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontroller");
const { body } = require("express-validator");
const ensureAuth = require("../middleware/auth").ensureAuth;

// Validation rules (customize as needed)
const userValidationRules = [
  body("displayName").notEmpty().withMessage("Display name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  // Add more rules as needed
];

// POST /users - Create user
router.post("/", ensureAuth, userValidationRules, userController.createUser);

// PUT /users/:id - Update user
router.put("/:id", ensureAuth, userValidationRules, userController.updateUser);

// DELETE /users/:id - Delete user
router.delete("/:id", ensureAuth, userController.deleteUser);

// GET /users - Get all users
router.get("/", ensureAuth, userController.getUsers);

// GET /users/:id - Get user by ID
router.get("/:id", ensureAuth, userController.getUserById);

module.exports = router;
