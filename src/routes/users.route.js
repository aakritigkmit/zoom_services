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

const router = express.Router();

router.post(
  "/",
  authenticate,
  validateRequest(registerSchema),
  checkRole(["Admin"]),
  userController.register,
);

router.get("/", authenticate, userController.fetchUser);

router.get(
  "/:id",
  authenticate,

  validateRequest(fetchUserByIdSchema, true),
  userController.fetchById,
);

router.get(
  "/:id/bookings",
  authenticate,
  checkRole(["Admin", "Customer", "Car Owner"]),
  userController.fetchAllBookingsForUser,
);

router.patch(
  "/:id",
  authenticate,
  validateRequest(fetchUserByIdSchema, true),
  validateRequest(editUserDetailsSchema),
  userController.editUserDetails,
);

router.delete(
  "/:id",
  authenticate,
  validateRequest(deleteUserByIdSchema, true),
  validateRequest(fetchUserByIdSchema, true),
  checkRole(["Admin"]),
  userController.removeUser,
);

module.exports = router;
