const express = require("express");
const {
  createOrder,
  getUserOrders,
  getTenantOrders,
} = require("../controllers/orderController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/orders", verifyToken, createOrder);
router.get("/orders/user", verifyToken, getUserOrders);
router.get("/orders/tenant", verifyToken, getTenantOrders);

module.exports = router;
