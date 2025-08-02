const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Please fill a valid email address"], // Basic email validation
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent OverwriteModelError in dev/hot-reload
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
