const express = require("express");
const {
  addToCart,
  getCart,
  deleteFromCart,
  updateCartItemQuantity,
  clearCart,
} = require("../controllers/cartController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/cart/add", verifyToken, addToCart);
router.get("/cart", verifyToken, getCart);
router.delete("/cart/:productId", verifyToken, deleteFromCart);
router.patch("/cart/:itemId", verifyToken, updateCartItemQuantity);
router.delete("/clear", verifyToken, clearCart);

module.exports = router;
