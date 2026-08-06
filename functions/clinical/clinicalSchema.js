const Joi = require('joi');

const signNoteSchema = Joi.object({
  noteId: Joi.string().required()
});

const updateNoteSchema = Joi.object({
  noteId: Joi.string().required(),
  privateContent: Joi.string().allow('').optional()
});

const publishSummarySchema = Joi.object({
  noteId: Joi.string().required(),
  sharedSummary: Joi.string().required()
});

const assignCarePlanSchema = Joi.object({
  patientId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('meditation', 'article', 'video', 'journal', 'assessment', 'community', 'next_session', 'custom').required(),
      resourceId: Joi.string().allow(null).optional(), // Can be null for custom items
      title: Joi.string().optional(), // For custom ad-hoc items
      dueDate: Joi.date().iso().required()
    })
  ).min(1).required()
});

const completeHomeworkSchema = Joi.object({
  itemId: Joi.string().required()
});

const assignAssessmentSchema = Joi.object({
  patientId: Joi.string().required(),
  templateId: Joi.string().required() // e.g., 'PHQ-9'
});

const submitAssessmentSchema = Joi.object({
  assignmentId: Joi.string().required(),
  answers: Joi.object().required()
});

module.exports = {
  signNoteSchema,
  updateNoteSchema,
  publishSummarySchema,
  assignCarePlanSchema,
  completeHomeworkSchema,
  assignAssessmentSchema,
  submitAssessmentSchema
};
