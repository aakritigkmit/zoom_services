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
const { userSerializerMiddleware } = require("../serializers/users.serializer");

const router = express.Router();

router.post(
  "/",
  authenticate,
  validateRequest(registerSchema),
  checkRole(["Admin"]),
  userController.register,
  userSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.get(
  "/",
  authenticate,
  userController.fetchUser,
  userSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.get(
  "/:id",
  authenticate,
  validateRequest(fetchUserByIdSchema, true),
  userController.fetchById,
  userSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.get(
  "/:id/bookings",
  authenticate,
  checkRole(["Admin", "Customer", "Car Owner"]),
  userController.fetchAllBookingsForUser,
  userSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.patch(
  "/:id",
  authenticate,
  validateRequest(fetchUserByIdSchema, true),
  validateRequest(editUserDetailsSchema),
  userController.editUserDetails,
  userSerializerMiddleware,
  commonHelpers.responseHandler,
);

router.delete(
  "/:id",
  authenticate,
  validateRequest(deleteUserByIdSchema, true),
  validateRequest(fetchUserByIdSchema, true),
  checkRole(["Admin"]),
  userController.removeUser,
  userSerializerMiddleware,
  commonHelpers.responseHandler,
);

module.exports = router;
