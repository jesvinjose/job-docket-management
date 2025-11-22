import Joi from "joi";

export const createJobSchema = Joi.object({
  clientName: Joi.string().trim().required().messages({
    "string.empty": "clientName is required",
    "any.required": "clientName is required",
  }),
  siteLocation: Joi.string().trim().required().messages({
    "string.empty": "siteLocation is required",
    "any.required": "siteLocation is required",
  }),
});
