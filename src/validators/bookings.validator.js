const Joi = require("joi");

const uuidSchema = Joi.string().guid({ version: "uuidv4" });
const dateSchema = Joi.date().iso();

const createBookingSchema = Joi.object({
  user_id: uuidSchema.required(),
  car_id: uuidSchema.required(),
  start_date: dateSchema.required(),
  end_date: dateSchema.required().min(Joi.ref("start_date")),
  drop_off_time: dateSchema.optional(),
  status: Joi.string().valid("picked_up", "dropped_off", "canceled").optional(),
  estimated_distance: Joi.number().integer().min(0).required(),
});

const updateBookingSchema = Joi.object({
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional().min(Joi.ref("start_date")),
  drop_off_time: dateSchema.optional(),
  status: Joi.string().valid("picked_up", "dropped_off", "canceled").optional(),
  estimated_distance: Joi.number().integer().min(0).optional(),
}).min(1); // At least one field is required for an update

const getBookingByIdSchema = Joi.object({
  id: uuidSchema.required(),
});

module.exports = {
  createBookingSchema,
  updateBookingSchema,
  getBookingByIdSchema,
};
