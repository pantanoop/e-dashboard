const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager"], required: true },
  tenantId: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: "2d" },
});

module.exports = mongoose.model("Invite", inviteSchema);
