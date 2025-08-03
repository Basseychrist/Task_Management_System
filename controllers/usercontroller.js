const { validationResult } = require("express-validator");
const User = require("../models/user"); // Adjust path/model as needed

// Helper function for error handling
const handleError = (
  res,
  error,
  message = "Server Error",
  statusCode = 500
) => {
  console.error(error);
  res.status(statusCode).render("error", {
    message: message,
    status: statusCode,
    error: error.message,
    title: "Error",
  });
};

// @desc    Get user profile
// @route   GET /users/:id
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      return handleError(
        res,
        new Error("User not found"),
        "User not found",
        404
      );
    }

    // Only allow viewing of own profile for now
    if (user._id.toString() !== req.user.id) {
      return handleError(
        res,
        new Error("Not authorized"),
        "You are not authorized to view this profile",
        403
      );
    }

    res.render("users/profile", {
      user,
      title: `${user.displayName}'s Profile`, // Pass title
    });
  } catch (err) {
    handleError(res, err, "Failed to fetch user profile", 500);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Adjust for your DB
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const isApi =
    req.headers.accept && req.headers.accept.includes("application/json");
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      if (isApi) return res.status(404).json({ message: "User not found" });
      return res
        .status(404)
        .render("errors/error", { message: "User not found" });
    }
    if (isApi) return res.json(user);
    res.render("users/profile", {
      user,
      title: `${user.displayName}'s Profile`,
    });
  } catch (err) {
    if (isApi)
      return res
        .status(500)
        .json({ message: "Failed to fetch user", error: err.message });
    res
      .status(500)
      .render("errors/error", { message: "Failed to fetch user", error: err });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  const isApi =
    req.headers.accept && req.headers.accept.includes("application/json");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (isApi) return res.status(400).json({ errors: errors.array() });
    return res
      .status(400)
      .render("users/new", { errors: errors.array(), user: req.body });
  }
  try {
    const user = await User.create(req.body);
    if (isApi) return res.status(201).json(user);
    req.flash("success_msg", "User created successfully!");
    res.redirect("/users");
  } catch (err) {
    if (isApi)
      return res
        .status(500)
        .json({ message: "Failed to create user", error: err.message });
    res
      .status(500)
      .render("errors/error", { message: "Failed to create user", error: err });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const isApi =
    req.headers.accept &&
    (req.headers.accept.includes("application/json") ||
      req.headers.accept === "*/*");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (isApi) return res.status(400).json({ errors: errors.array() });
    return res
      .status(400)
      .render("users/edit", { errors: errors.array(), user: req.body });
  }
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      if (isApi) return res.status(404).json({ message: "User not found" });
      return res
        .status(404)
        .render("errors/error", { message: "User not found" });
    }
    if (isApi) return res.json(user);
    req.flash("success_msg", "User updated successfully!");
    res.redirect("/users");
  } catch (err) {
    if (isApi)
      return res
        .status(500)
        .json({ message: "Failed to update user", error: err.message });
    res
      .status(500)
      .render("errors/error", { message: "Failed to update user", error: err });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const isApi =
    req.headers.accept &&
    (req.headers.accept.includes("application/json") ||
      req.headers.accept === "*/*");
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      if (isApi) return res.status(404).json({ message: "User not found" });
      return res
        .status(404)
        .render("errors/error", { message: "User not found" });
    }
    if (isApi)
      return res.status(200).json({ message: "User deleted successfully" });
    req.flash("success_msg", "User deleted successfully!");
    res.redirect("/users");
  } catch (err) {
    if (isApi)
      return res
        .status(500)
        .json({ message: "Failed to delete user", error: err.message });
    res
      .status(500)
      .render("errors/error", { message: "Failed to delete user", error: err });
  }
};

exports.getUsers = async (req, res) => {
  const isApi =
    req.headers.accept && req.headers.accept.includes("application/json");
  try {
    const users = await User.find().lean();
    if (isApi) return res.json(users);
    res.render("users/index", { users, title: "All Users" });
  } catch (err) {
    if (isApi)
      return res
        .status(500)
        .json({ message: "Failed to fetch users", error: err.message });
    res
      .status(500)
      .render("errors/error", { message: "Failed to fetch users", error: err });
  }
};

