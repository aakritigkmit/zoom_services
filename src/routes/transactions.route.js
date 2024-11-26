const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactions.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/roles.middleware");
const commonHelpers = require("../helpers/common.helper");
const {
  transactionSerializer,
} = require("../serializers/transactions.serializer");

router.post(
  "/",
  authenticate,
  transactionController.create,
  transactionSerializer,
  commonHelpers.responseHandler,
);
router.get(
  "/",
  authenticate,
  transactionController.fetchAll,
  transactionSerializer,
  commonHelpers.responseHandler,
);

router.get(
  "/:id",
  authenticate,
  transactionController.fetchById,
  transactionSerializer,
  commonHelpers.responseHandler,
);

router.delete(
  "/:id",
  authenticate,
  checkRole(["Admin", "Customer"]),
  transactionController.remove,
  transactionSerializer,
  commonHelpers.responseHandler,
);

module.exports = router;
