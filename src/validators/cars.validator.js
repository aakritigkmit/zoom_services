const Joi = require("joi");

// Schema for creating a car
const createCarSchema = Joi.object({
  model: Joi.string().required(),
  type: Joi.string().required(),
  year: Joi.number().integer().min(1886).required(),
  fuel_type: Joi.string().valid("cng", "diesel", "petrol").required(),
  city: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  price_per_km: Joi.number().min(0).required(),
  price_per_hr: Joi.number().min(0).required(),
  status: Joi.string().valid("available", "unavailable", "booked").required(),
});

const updateCarSchema = Joi.object({
  model: Joi.string().optional(),
  type: Joi.string().optional(),
  year: Joi.number().integer().min(1886).optional(),
  fuel_type: Joi.string().valid("cng", "diesel", "petrol").optional(),
  city: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  price_per_km: Joi.number().min(0).optional(),
  price_per_hr: Joi.number().min(0).optional(),
  status: Joi.string().valid("available", "unavailable", "booked").optional(),
});

const updateCarStatusSchema = Joi.object({
  status: Joi.string().valid("available", "unavailable", "booked").required(),
});

module.exports = {
  createCarSchema,
  updateCarSchema,
  updateCarStatusSchema,
};
