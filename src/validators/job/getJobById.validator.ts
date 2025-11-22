import Joi from "joi";

export const jobIdParamSchema = Joi.object({
  id: Joi.string().length(24).required().messages({
    "string.length": "Invalid job ID format",
    "any.required": "Job ID is required",
  }),
});
