const mongoose = require("mongoose");

const organisationSchema = new mongoose.Schema({
  organisationName: { type: String, required: true },
  tenantId: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Organisation", organisationSchema);
