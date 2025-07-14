const express = require("express");
const router = express.Router();
const {
  createOrganisation,
  updateUserRoleTenant,
} = require("../controllers/orgController");
const verifyToken = require("../middleware/verifyToken");

router.post("/create", verifyToken, createOrganisation);
router.put("/user/update-role", verifyToken, updateUserRoleTenant);

module.exports = router;
