const express = require("express");

const userController = require("../controllers/users.controller");
const checkRole = require("../middlewares/roles.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validator.middleware");
const {
  registerSchema,
  fetchUserByIdSchema,
  editUserDetailsSchema,
  deleteUserByIdSchema,
} = require("../validators/users.validator");

const commonHelpers = require("../helpers/common.helper");
const { userSerializer } = require("../serializers/users.serializer");

const router = express.Router();

router.post(
  "/",
  authenticate,
  validateRequest(registerSchema),
  checkRole(["Admin"]),
  userController.create,
  userSerializer,
  commonHelpers.responseHandler,
);

router.get(
  "/",
  authenticate,
  userController.fetchUsers,
  userSerializer,
  commonHelpers.responseHandler,
);

router.get(
  "/me",
  authenticate,
  userController.fetchCurrentUser,
  userSerializer,
  commonHelpers.responseHandler,
);

router.put(
  "/me",
  authenticate,
  userController.updateCurrentUserDetails,
  userSerializer,
  commonHelpers.responseHandler,
);

router.get(
  "/:id",
  authenticate,
  validateRequest(fetchUserByIdSchema, true),
  userController.fetchById,
  userSerializer,
  commonHelpers.responseHandler,
);

router.get(
  "/:id/transactions",
  authenticate,
  checkRole(["Admin", "Customer"]),
  userController.fetchTransactions,
  userSerializer,
  commonHelpers.responseHandler,
);
router.get(
  "/:id/bookings",
  authenticate,
  userController.fetchBookings,
  userSerializer,
  commonHelpers.responseHandler,
);

router.patch(
  "/:id",
  authenticate,
  validateRequest(fetchUserByIdSchema, true),
  validateRequest(editUserDetailsSchema),
  userController.update,
  userSerializer,
  commonHelpers.responseHandler,
);

router.delete(
  "/:id",
  authenticate,
  validateRequest(deleteUserByIdSchema, true),
  validateRequest(fetchUserByIdSchema, true),
  checkRole(["Admin"]),
  userController.remove,
  userSerializer,
  commonHelpers.responseHandler,
);

module.exports = router;
