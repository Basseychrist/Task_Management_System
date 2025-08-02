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
      .populate("createdBy", "displayName")
      .populate("assignedTo", "displayName")
      .sort({ createdAt: "desc" })
      .lean();

    // Return JSON if API client (Swagger UI, Postman, etc)
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json(tasks);
    }

    // Otherwise, render the HTML view
    res.render("tasks/index", {
      tasks,
      title: "My Tasks",
    });
  } catch (err) {
    // Return JSON error for API clients
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res
        .status(500)
        .json({ message: "Failed to fetch tasks", error: err.message });
    }
    handleError(res, err, "Failed to fetch tasks", 500);
  }
};

// @desc    Show single task
// @route   GET /tasks/:id
exports.getTaskById = async (req, res) => {
  const isApi =
    req.headers.accept && req.headers.accept.includes("application/json");
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "displayName email")
      .populate("assignedTo", "displayName email")
      .lean();

    if (!task) {
      if (isApi) {
        return res.status(404).json({ message: "Task not found" });
      }
      return handleError(
        res,
        new Error("Task not found"),
        "Task not found",
        404
      );
    }

    // Optional: restrict access to owner or assigned user
    if (
      task.createdBy._id.toString() !== req.user.id &&
      task.assignedTo &&
      task.assignedTo._id.toString() !== req.user.id
    ) {
      if (isApi) {
        return res.status(403).json({ message: "Not authorized" });
      }
      return handleError(
        res,
        new Error("Not authorized"),
        "You are not authorized to view this task",
        403
      );
    }

    if (isApi) {
      return res.json(task);
    }

    res.render("tasks/show", {
      task,
      title: task.title,
    });
  } catch (err) {
    if (isApi) {
      return res
        .status(500)
        .json({ message: "Failed to fetch task", error: err.message });
    }
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
  const isApi =
    req.headers.accept && req.headers.accept.includes("application/json");

  if (!errors.isEmpty()) {
    if (isApi) {
      return res.status(400).json({ errors: errors.array() });
    }
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("displayName")
      .lean();
    return res.status(400).render("tasks/new", {
      errors: errors.array(),
      task: req.body,
      users,
      title: "Add New Task",
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

    // Only use assignedTo as an ObjectId string
    const assignedToId =
      typeof assignedTo === "object" && assignedTo._id
        ? assignedTo._id
        : assignedTo;

    // Tags: handle array or string
    let tagsArray = tags;
    if (typeof tagsArray === "string") {
      tagsArray = tagsArray
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(tagsArray)) {
      tagsArray = tagsArray.map((t) => t.trim());
    }

    // Attachments: handle array or string
    let attachmentsArray = attachments;
    if (typeof attachmentsArray === "string") {
      try {
        attachmentsArray = JSON.parse(attachmentsArray);
      } catch {
        attachmentsArray = [];
      }
    } else if (!Array.isArray(attachmentsArray)) {
      attachmentsArray = [];
    }

    const newTask = {
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedToId || null,
      createdBy: req.user.id,
      tags: tagsArray || [],
      attachments: attachmentsArray,
    };

    const createdTask = await Task.create(newTask);

    if (isApi) {
      return res.status(201).json(createdTask);
    }

    req.flash("success_msg", "Task created successfully!");
    res.redirect("/tasks");
  } catch (err) {
    if (isApi) {
      return res
        .status(500)
        .json({ message: "Failed to create task", error: err.message });
    }
    // If it's a Mongoose validation error, show errors in the form
    if (err.name === "ValidationError") {
      const users = await User.find({ _id: { $ne: req.user.id } })
        .select("displayName")
        .lean();
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
  const isApi =
    req.headers.accept && req.headers.accept.includes("application/json");

  if (!errors.isEmpty()) {
    if (isApi) {
      return res.status(400).json({ errors: errors.array() });
    }
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("displayName")
      .lean();
    const task = await Task.findById(req.params.id).lean();
    return res.status(400).render("tasks/edit", {
      errors: errors.array(),
      task: { ...task, ...req.body },
      users,
      title: `Edit Task: ${task ? task.title : "N/A"}`,
    });
  }

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      if (isApi) {
        return res.status(404).json({ message: "Task not found" });
      }
      return handleError(
        res,
        new Error("Task not found"),
        "Task not found",
        404
      );
    }

    if (task.createdBy.toString() !== req.user.id) {
      if (isApi) {
        return res.status(403).json({ message: "Not authorized" });
      }
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

    // Only use assignedTo as an ObjectId string
    const assignedToId =
      typeof assignedTo === "object" && assignedTo._id
        ? assignedTo._id
        : assignedTo;

    // Tags: handle array or string
    let tagsArray = tags;
    if (typeof tagsArray === "string") {
      tagsArray = tagsArray
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(tagsArray)) {
      tagsArray = tagsArray.map((t) => t.trim());
    }

    // Attachments: handle array or string
    let attachmentsArray = attachments;
    if (typeof attachmentsArray === "string") {
      try {
        attachmentsArray = JSON.parse(attachmentsArray);
      } catch {
        attachmentsArray = [];
      }
    } else if (!Array.isArray(attachmentsArray)) {
      attachmentsArray = [];
    }

    const updateData = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedToId || null,
      tags: tagsArray || [],
      attachments: attachmentsArray,
      updatedAt: Date.now(),
    };

    task = await Task.findOneAndUpdate({ _id: req.params.id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (isApi) {
      return res.json(task);
    }

    req.flash("success_msg", "Task updated successfully!");
    res.redirect("/tasks");
  } catch (err) {
    if (isApi) {
      return res
        .status(500)
        .json({ message: "Failed to update task", error: err.message });
    }
    handleError(res, err, "Failed to update task", 500);
  }
};

// @desc    Delete task
// @route   DELETE /tasks/:id
exports.deleteTask = async (req, res) => {
  const isApi =
    req.headers.accept &&
    (req.headers.accept.includes("application/json") ||
      req.headers.accept === "*/*");
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      if (isApi) {
        return res.status(404).json({ message: "Task not found" });
      }
      return handleError(
        res,
        new Error("Task not found"),
        "Task not found",
        404
      );
    }

    if (task.createdBy.toString() !== req.user.id) {
      if (isApi) {
        return res.status(403).json({ message: "Not authorized" });
      }
      return handleError(
        res,
        new Error("Not authorized"),
        "You are not authorized to delete this task",
        403
      );
    }

    await Task.deleteOne({ _id: req.params.id });

    if (isApi) {
      return res.status(200).json({ message: "Task deleted successfully" });
    }

    req.flash("success_msg", "Task deleted successfully!");
    res.redirect("/tasks");
  } catch (err) {
    if (isApi) {
      return res
        .status(500)
        .json({ message: "Failed to delete task", error: err.message });
    }
    handleError(res, err, "Failed to delete task", 500);
  }
};
