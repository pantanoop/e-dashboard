const Razorpay = require("razorpay");
const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const options = {
      amount: req.body.amount,
      currency: "INR",
      receipt: `receipt_order_${Math.random().toString(36).substr(2, 9)}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ order }); // ✅ This must be present
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// Verify Razorpay Payment
router.post("/verify", verifyToken, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return res
      .status(200)
      .json({ success: true, message: "Payment verified successfully" });
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Invalid signature" });
  }
});

module.exports = router;
