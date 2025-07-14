const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
} = require("../controllers/productController");

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);

// Admin-only
router.post("/addProduct", verifyAdmin, addProduct);
router.put("/product/:id", verifyAdmin, updateProduct);
router.delete("/product/:id", verifyAdmin, deleteProduct);

// Regular access
router.get("/products", getProducts);
router.get("/product/:id", getProduct);
router.get("/search/:key", searchProduct);

module.exports = router;
