const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .message("Phone number must be exactly 10 digits.")
    .required(),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long.",
  }),
  roles: Joi.array()
    .items(
      Joi.string()
        .valid("Car Owner", "Customer")
        .not(Joi.string().valid("Admin"))
        .required(),
    )
    .required(),
  city: Joi.string().min(3).max(100).required(),
});

const fetchUserByIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "ID should be a string",
    "string.empty": "ID cannot be empty",
    "any.required": "ID is required",
  }),
});

const editUserDetailsSchema = Joi.object({
  name: Joi.string().min(3).max(30).messages({
    "string.base": "Name should be a string",
    "string.min": "Name should have at least 3 characters",
    "string.max": "Name should not exceed 30 characters",
  }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Phone number must be a valid 10-digit number",
    }),
  roles: Joi.array().items(
    Joi.string().valid("Car Owner", "Admin", "Customer"),
  ),
  city: Joi.string().min(2).max(50).messages({
    "string.min": "City name should be at least 2 characters",
    "string.max": "City name should not exceed 50 characters",
  }),
});

const deleteUserByIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "ID should be a string",
    "string.empty": "ID cannot be empty",
    "any.required": "ID is required",
  }),
});

module.exports = {
  deleteUserByIdSchema,
  editUserDetailsSchema,
  fetchUserByIdSchema,
  registerSchema,
};
