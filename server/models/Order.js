const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "failed", "pending"],
      default: "pending",
    },
    paymentId: String,
    orderId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
