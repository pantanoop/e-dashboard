const express = require("express");
const router = express.Router();
const { sendInvite, acceptInvite } = require("../controllers/inviteController");
const verifyToken = require("../middleware/verifyToken");

// ❗ Apply middleware ONLY to this route
router.post("/invite", verifyToken, sendInvite);

// ❗ DO NOT protect this route — allow public signup
router.post("/accept-invite", verifyToken, acceptInvite);

module.exports = router;
