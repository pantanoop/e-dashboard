// models/Cart.js

const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // ID of the user who owns this cart
    },
    tenantId: {
      type: String, // So we know which tenant the user belongs to
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Reference to the Product model
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
