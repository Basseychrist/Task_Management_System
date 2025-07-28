// config/database.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load config (ensure this is done before using process.env.MONGO_URI)
dotenv.config({ path: './.env' }); // Make sure the path is correct relative to where database.js is called

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
