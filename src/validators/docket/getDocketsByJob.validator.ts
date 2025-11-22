import Joi from "joi";

export const getDocketsParamsSchema = Joi.object({
  jobId: Joi.string().length(24).required().messages({
    "string.length": "Invalid jobId format",
    "any.required": "jobId is required",
  }),
});

export const getDocketsQuerySchema = Joi.object({
  from: Joi.string()
    .pattern(/^\d{2}-\d{2}-\d{4}$/)
    .optional()
    .messages({
      "string.pattern.base": "from must be in DD-MM-YYYY format",
    }),

  to: Joi.string()
    .pattern(/^\d{2}-\d{2}-\d{4}$/)
    .optional()
    .messages({
      "string.pattern.base": "to must be in DD-MM-YYYY format",
    }),

  supervisorName: Joi.string().optional().messages({
    "string.base": "supervisorName must be a string",
  }),
});
