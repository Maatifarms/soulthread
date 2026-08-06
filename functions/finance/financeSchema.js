const Joi = require('joi');

const createPaymentSchema = Joi.object({
  bookingId: Joi.string().required()
});

const verifyPaymentSchema = Joi.object({
  paymentId: Joi.string().required(),
  gatewaySignature: Joi.string().required(),
  rawPayload: Joi.any().required()
});

const recordCashPaymentSchema = Joi.object({
  bookingId: Joi.string().required()
});

const createRefundSchema = Joi.object({
  paymentId: Joi.string().required(),
  amount: Joi.number().positive().optional(), // Full refund if missing
  reason: Joi.string().required()
});

module.exports = {
  createPaymentSchema,
  verifyPaymentSchema,
  recordCashPaymentSchema,
  createRefundSchema
};
