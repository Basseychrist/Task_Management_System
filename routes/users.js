const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontroller");

// GET /users - Get all users
router.get("/", userController.getAllUsers);

// GET /users/:id - Get user by ID
router.get("/:id", userController.getUserById);

module.exports = router;
