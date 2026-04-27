const mongoose = require("mongoose");

async function connectDB() {
  mongoose.set("strictQuery", true);
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017", {
      dbName: process.env.MONGODB_DB_NAME || "kev_catalog",
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}

module.exports = connectDB;
