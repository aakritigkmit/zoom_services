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
  roleName: Joi.array()
    .items(Joi.string().valid("Car Owner", "Admin", "Customer").required())
    .required(),
  city: Joi.string().min(3).max(100).required(),
});

module.exports = {
  registerSchema,
};
