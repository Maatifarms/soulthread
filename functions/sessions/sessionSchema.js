const Joi = require('joi');

const createSessionSchema = Joi.object({
  bookingId: Joi.string().required()
});

const sessionIdSchema = Joi.object({
  sessionId: Joi.string().required()
});

const reportIssueSchema = Joi.object({
  sessionId: Joi.string().required(),
  details: Joi.string().required()
});

module.exports = {
  createSessionSchema,
  sessionIdSchema,
  reportIssueSchema
};
