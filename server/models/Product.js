const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  company: String,
  userId: String,
  tenantId: { type: String, required: true },
});

module.exports = mongoose.model("Product", productSchema);
