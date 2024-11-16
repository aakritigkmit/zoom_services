const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactions.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/", authenticate, transactionController.generate);

module.exports = router;
