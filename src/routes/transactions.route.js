const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactions.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/roles.middleware");

router.post("/", authenticate, transactionController.generate);
router.get("/", authenticate, transactionController.fetchAll);

router.get("/:id", authenticate, transactionController.fetchById);

router.delete(
  "/:id",
  authenticate,
  checkRole(["Admin", "Customer"]),
  transactionController.remove,
);

module.exports = router;
