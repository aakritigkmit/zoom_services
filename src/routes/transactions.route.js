const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactions.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/roles.middleware");
const commonHelpers = require("../helpers/common.helper");
const {
  transactionSerializerMiddleware,
} = require("../serializers/transactions.serializer");

router.post(
  "/",
  authenticate,
  transactionController.generate,
  transactionSerializerMiddleware,
  commonHelpers.responseHandler,
);
router.get(
  "/",
  authenticate,
  transactionController.fetchAll,
  transactionSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.get(
  "/:id",
  authenticate,
  transactionController.fetchById,
  transactionSerializerMiddleware,
  transactionSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.delete(
  "/:id",
  authenticate,
  checkRole(["Admin", "Customer"]),
  transactionController.remove,
  transactionSerializerMiddleware,
  commonHelpers.responseHandler,
);

module.exports = router;
