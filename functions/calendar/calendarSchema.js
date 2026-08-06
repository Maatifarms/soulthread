const Joi = require('joi');

const timeFormat = Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required();

const updateAvailabilitySchema = Joi.object({
  guideId: Joi.string().required(),
  timezone: Joi.string().required(), // Should validate valid IANA tz db string
  sessionDuration: Joi.number().valid(15, 30, 45, 60, 90).required(),
  bufferTime: Joi.number().valid(0, 5, 10, 15, 30).required(),
  workingHours: Joi.object().pattern(
    Joi.string().valid('0', '1', '2', '3', '4', '5', '6'), // 0 = Sunday
    Joi.array().items(
      Joi.object({
        start: timeFormat,
        end: timeFormat
      })
    )
  ).required()
});

const blockDateSchema = Joi.object({
  guideId: Joi.string().required(),
  type: Joi.string().valid('vacation', 'holiday', 'blocked').required(),
  startDate: Joi.string().isoDate().required(), // YYYY-MM-DD
  endDate: Joi.string().isoDate().required(),
  reason: Joi.string().optional()
});

const reserveSlotSchema = Joi.object({
  guideId: Joi.string().required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required()
});

module.exports = {
  updateAvailabilitySchema,
  blockDateSchema,
  reserveSlotSchema
};
