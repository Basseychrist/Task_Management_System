const Task = require("../models/task");
const User = require("../models/user");
const { validationResult } = require("express-validator");

// Helper function for error handling
const handleError = (
  res,
  error,
  message = "Server Error",
  statusCode = 500
) => {
  console.error(error);
  res.status(statusCode).render("errors/error", {
    // <-- update this line
    message: message,
    status: statusCode,
    error: error.message,
    title: "Error",
  });
};

// @desc    Show all tasks
// @route   GET /tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id })
      .populate("createdBy", "displayName") // Populate createdBy with displayName
      .populate("assignedTo", "displayName") // Populate assignedTo with displayName
      .sort({ createdAt: "desc" })
      .lean(); // Use lean() for plain JavaScript objects

    res.render("tasks/index", {
      tasks,
      title: "My Tasks", // Pass title for dynamic EJS head
    });
  } catch (err) {
    handleError(res, err, "Failed to fetch tasks", 500);
  }
};

// @desc    Show single task
// @route   GET /tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "displayName email")
      .populate("assignedTo", "displayName email")
      .lean();

    if (!task) {
      return handleError(
        res,
        new Error("Task not found"),
        "Task not found",
        404
      );
    }

    if (
      task.createdBy._id.toString() !== req.user.id &&
      task.assignedTo &&
      task.assignedTo._id.toString() !== req.user.id
    ) {
      return handleError(
        res,
        new Error("Not authorized"),
        "You are not authorized to view this task",
        403
      );
    }

    res.render("tasks/show", {
      task,
      title: task.title, // Pass title for dynamic EJS head
    });
  } catch (err) {
    handleError(res, err, "Failed to fetch task", 500);
  }
};

// @desc    Show add task page
// @route   GET /tasks/new
exports.newTaskPage = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("displayName")
      .lean();
    res.render("tasks/new", {
      users,
      errors: null,
      title: "Add New Task", // Pass title
      task: {}, // <-- Always pass an empty task object
    });
  } catch (err) {
    handleError(res, err, "Failed to load new task form", 500);
  }
};

// Example controller for rendering the new task form
exports.newTaskForm = (req, res) => {
  res.render("tasks/new", {
    title: "Create New Task",
    task: {}, // Pass an empty object if creating a new task
  });
};

// @desc    Process add task form
// @route   POST /tasks
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("displayName")
      .lean();
    return res.status(400).render("tasks/new", {
      errors: errors.array(),
      task: req.body, // Pass existing data back to form
      users,
      title: "Add New Task", // Pass title
    });
  }

  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      tags,
      attachments,
    } = req.body;

    let tagsArray = tags;
    if (typeof tagsArray === "string") {
      tagsArray = tagsArray
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const newTask = {
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      tags: tagsArray || [],
      attachments: attachments ? JSON.parse(attachments) : [], // Assuming attachments come as a JSON string
    };

    await Task.create(newTask);
    req.flash("success_msg", "Task created successfully!");
    res.redirect("/tasks");
  } catch (err) {
    // If it's a Mongoose validation error, show errors in the form
    if (err.name === "ValidationError") {
      const users = await User.find({ _id: { $ne: req.user.id } })
        .select("displayName")
        .lean();
      // Convert Mongoose errors to array for EJS
      const errors = Object.values(err.errors).map((e) => ({ msg: e.message }));
      return res.status(400).render("tasks/new", {
        errors,
        task: req.body,
        users,
        title: "Add New Task",
      });
    }
    handleError(res, err, "Failed to create task", 500);
  }
};

// @desc    Show edit task page
// @route   GET /tasks/:id/edit
exports.editTaskPage = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).lean();

    if (!task) {
      return handleError(
        res,
        new Error("Task not found"),
        "Task not found",
        404
      );
    }

    if (task.createdBy.toString() !== req.user.id) {
      return handleError(
        res,
        new Error("Not authorized"),
        "You are not authorized to edit this task",
        403
      );
    }
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("displayName")
      .lean();
    res.render("tasks/edit", {
      task,
      users,
      errors: null,
      title: `Edit Task: ${task.title}`, // Pass title
    });
  } catch (err) {
    handleError(res, err, "Failed to load edit form", 500);
  }
};

// @desc    Process update task form
// @route   PUT /tasks/:id
exports.updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("displayName")
      .lean();
    const task = await Task.findById(req.params.id).lean(); // Re-fetch task to pass to form
    return res.status(400).render("tasks/edit", {
      errors: errors.array(),
      task: { ...task, ...req.body }, // Merge existing with new data
      users,
      title: `Edit Task: ${task ? task.title : "N/A"}`, // Pass title
    });
  }

  try {
    let task = await Task.findById(req.params.id).lean();

    if (!task) {
      return handleError(
        res,
        new Error("Task not found"),
        "Task not found",
        404
      );
    }

    if (task.createdBy.toString() !== req.user.id) {
      return handleError(
        res,
        new Error("Not authorized"),
        "You are not authorized to update this task",
        403
      );
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      tags,
      attachments,
    } = req.body;

    let tagsArray = tags;
    if (typeof tagsArray === "string") {
      tagsArray = tagsArray
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const updateData = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedTo || null,
      tags: tagsArray || [],
      attachments: attachments ? JSON.parse(attachments) : [],
      updatedAt: Date.now(),
    };

    task = await Task.findOneAndUpdate({ _id: req.params.id }, updateData, {
      new: true,
      runValidators: true,
    });
    req.flash("success_msg", "Task updated successfully!");
    res.redirect("/tasks");
  } catch (err) {
    handleError(res, err, "Failed to update task", 500);
  }
};

// @desc    Delete task
// @route   DELETE /tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).lean();

    if (!task) {
      return handleError(
        res,
        new Error("Task not found"),
        "Task not found",
        404
      );
    }

    if (task.createdBy.toString() !== req.user.id) {
      return handleError(
        res,
        new Error("Not authorized"),
        "You are not authorized to delete this task",
        403
      );
    }

    await Task.deleteOne({ _id: req.params.id });
    req.flash("success_msg", "Task deleted successfully!");
    res.redirect("/tasks");
  } catch (err) {
    handleError(res, err, "Failed to delete task", 500);
  }
};
