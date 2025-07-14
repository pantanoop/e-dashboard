const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  tenantId: String,
  role: {
    type: String,
    enum: ["admin", "user", "manager"], // Only these two roles allowed
    default: "user",
  },
});

module.exports = mongoose.model("User", userSchema);
