const express = require("express");
const router = express.Router();

const {
  getTenantUsers,
  promoteToManager,
  deleteAdmin,
  addAdmin,
} = require("../controllers/adminController");
const verifyToken = require("../middleware/verifyToken");

router.get("/users", verifyToken, getTenantUsers);
router.put("/promote/:userId", verifyToken, promoteToManager);
router.delete("/delete/:userId", verifyToken, deleteAdmin);
router.post("/add-admin", verifyToken, addAdmin);
module.exports = router;
