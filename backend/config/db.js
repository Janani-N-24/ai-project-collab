const mongoose = require('mongoose');

// Connects to MongoDB Atlas using the URI from environment variables.
// Exits the process if the connection fails, since the app cannot function without a DB.
const connectDB = async () => {
  try {
    console.log("Mongo URI:", process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
