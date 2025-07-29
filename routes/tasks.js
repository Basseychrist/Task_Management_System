const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { ensureAuth } = require("../middleware/auth");
const { body } = require("express-validator");

// Validation middleware for task creation and update
const validateTask = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters")
    .notEmpty()
    .withMessage("Title is required"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters")
    .notEmpty()
    .withMessage("Description is required"),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "completed", "cancelled"])
    .withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage("Invalid date format for Due Date")
    .custom((value) => {
      if (value) {
        const inputDate = new Date(value);
        // Compare with current date in Uyo
        const nowInUyo = new Date(); // Assuming server is in Uyo or handling timezone correctly
        // For strict Uyo time, you'd need a library like moment-timezone or careful Date manipulation
        // For basic 'future' check, comparing against server time is usually sufficient for forms.
        if (inputDate < nowInUyo) {
          throw new Error("Due date cannot be in the past");
        }
      }
      return true;
    }),
  body("assignedTo")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid assigned user ID"),
  body("tags")
    .optional({ nullable: true })
    .custom((value) => {
      if (value) {
        const tagsArray = value.split(",").map((tag) => tag.trim());
        if (
          !tagsArray.every((tag) => typeof tag === "string" && tag.length > 0)
        ) {
          throw new Error(
            "Tags must be a comma-separated list of non-empty strings"
          );
        }
      }
      return true;
    }),
  body("attachments")
    .optional({ nullable: true })
    .custom((value) => {
      try {
        if (value) {
          const attachmentsArray = JSON.parse(value);
          if (
            !Array.isArray(attachmentsArray) ||
            !attachmentsArray.every((att) => att.filename && att.url)
          ) {
            throw new Error(
              "Attachments must be a JSON array of objects with filename and url"
            );
          }
        }
      } catch (e) {
        throw new Error("Attachments must be a valid JSON array");
      }
      return true;
    }),
];

router.get("/", ensureAuth, taskController.getTasks);

router.get("/new", ensureAuth, taskController.newTaskPage);

router.post("/", ensureAuth, validateTask, taskController.createTask);

router.get("/:id", ensureAuth, taskController.getTaskById);

router.get("/:id/edit", ensureAuth, taskController.editTaskPage);

router.put("/:id", ensureAuth, validateTask, taskController.updateTask);

router.delete("/:id", ensureAuth, taskController.deleteTask);

module.exports = router;
