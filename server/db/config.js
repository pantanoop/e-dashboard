const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/e-commerce");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Mongo connection failed", err);
    process.exit(1);
  }
};

module.exports = connectDB;
