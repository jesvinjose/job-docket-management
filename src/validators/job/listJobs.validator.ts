import Joi from "joi";

export const listJobsQuerySchema = Joi.object({
  status: Joi.string().valid("open", "closed").optional().messages({
    "any.only": "status must be either 'open' or 'closed'",
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "page must be a number",
    "number.min": "page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).default(10).messages({
    "number.base": "limit must be a number",
    "number.min": "limit must be at least 1",
  }),
});
