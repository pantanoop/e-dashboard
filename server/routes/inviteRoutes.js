const express = require("express");
const router = express.Router();
const { sendInvite, acceptInvite } = require("../controllers/inviteController");
const verifyToken = require("../middleware/verifyToken");


router.post("/invite", verifyToken, sendInvite);


router.post("/accept-invite", verifyToken, acceptInvite);

module.exports = router;
