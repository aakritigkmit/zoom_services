const Joi = require("joi");

const sendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),

  password: Joi.string().min(6).required(),
  roleName: Joi.string()
    .valid("Customer", "Car Owner")
    .default("Customer")
    .not(Joi.string().valid("Admin")),
  city: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
};
