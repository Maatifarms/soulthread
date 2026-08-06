// Simple validator schema for Booking Payloads
const Joi = require('joi'); // assuming Joi for validation, though we might not have it installed yet

const createBookingSchema = Joi.object({
  patientId: Joi.string().required(),
  guideId: Joi.string().required(),
  sessionType: Joi.string().valid('video', 'audio', 'chat', 'offline').required(),
  sessionDurationMins: Joi.number().integer().min(15).max(120).required(),
  scheduledStartTime: Joi.date().iso().required(),
  scheduledEndTime: Joi.date().iso().required(),
  timezonePatient: Joi.string().required(),
  timezoneGuide: Joi.string().required(),
});

const transitionBookingSchema = Joi.object({
  bookingId: Joi.string().required(),
  reason: Joi.string().optional()
});

module.exports = {
  createBookingSchema,
  transitionBookingSchema
};
