const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(v) {
        // Allow null, or check if the date is in the future relative to current time in Uyo
        if (v === null) return true;

        const now = new Date();
        // Adjust 'now' to Uyo time if necessary, or assume server time is sufficient for "future" check
        // For simplicity, using server's current time for comparison
        return v > now;
      },
      message: props => `${props.value} is not a valid future date!`
    },
    default: null,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  tags: {
    type: [String], // Array of strings
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(tag => typeof tag === 'string' && tag.length > 0);
      },
      message: props => `${props.value} is not a valid array of strings for tags!`
    }
  },
  attachments: [
    {
      filename: { type: String, required: true },
      url: { type: String, required: true },
      size: { type: Number },
    },
  ],
});

// Update 'updatedAt' field on save
TaskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
