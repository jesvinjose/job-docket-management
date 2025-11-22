import { Request, Response, NextFunction } from "express";

interface ValidatorSchema {
  body?: any;
  params?: any;
  query?: any;
}

export const validateRequest = (schema: ValidatorSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body);
        if (error) {
          return res.status(400).json({
            status: false,
            message: error.details[0].message,
          });
        }
        req.body = value; // sanitized values
      }

      // Validate params
      if (schema.params) {
        const { error, value } = schema.params.validate(req.params);
        if (error) {
          return res.status(400).json({
            status: false,
            message: error.details[0].message,
          });
        }
        req.params = value;
      }

      // Validate query
      if (schema.query) {
        const { error, value } = schema.query.validate(req.query);
        if (error) {
          return res.status(400).json({
            status: false,
            message: error.details[0].message,
          });
        }
        req.query = value;
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Validation error" });
    }
  };
};
