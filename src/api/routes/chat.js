const express = require("express");
const router = express.Router();
const { getHistoryCallback, chatCallback } = require("../controllers/chatController");


router.get("/", getHistoryCallback);
router.post("/", chatCallback);

module.exports = router;