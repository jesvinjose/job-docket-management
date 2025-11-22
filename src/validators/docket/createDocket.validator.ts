import Joi from "joi";

export const createDocketParamsSchema = Joi.object({
  jobId: Joi.string().length(24).required().messages({
    "string.length": "Invalid jobId format",
    "any.required": "jobId is required",
  }),
});

export const createDocketBodySchema = Joi.object({
  supervisorName: Joi.string().trim().required().messages({
    "string.empty": "supervisorName is required",
    "any.required": "supervisorName is required",
  }),

  date: Joi.string()
    .pattern(/^\d{2}-\d{2}-\d{4}$/)
    .required()
    .messages({
      "string.pattern.base": "date must be in DD-MM-YYYY format",
      "string.empty": "date is required",
      "any.required": "date is required",
    }),

  labourItems: Joi.array()
    .items(
      Joi.object({
        workerName: Joi.string().required().messages({
          "string.empty": "workerName is required",
          "any.required": "workerName is required",
        }),
        role: Joi.string().required().messages({
          "string.empty": "role is required",
          "any.required": "role is required",
        }),
        hoursWorked: Joi.number().greater(0).required().messages({
          "number.base": "hoursWorked must be a number",
          "number.greater": "hoursWorked must be greater than 0",
          "any.required": "hoursWorked is required",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "labourItems must contain at least one item",
      "any.required": "labourItems is required",
    }),

  notes: Joi.string().optional(),
});
