const express = require("express");

const userController = require("../controllers/users.controller");
const checkRole = require("../middlewares/roles.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validator.middleware");
const {
  registerSchema,
  fetchUserByIdSchema,
  editUserDetailsSchema,
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

router.patch(
  "/:id",
  authenticate,
  validateRequest(fetchUserByIdSchema, true),
  validateRequest(editUserDetailsSchema),
  userController.editUserDetails,
);

module.exports = router;
