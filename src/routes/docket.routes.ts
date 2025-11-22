import { Router } from "express";
import {
  createDocket,
  getDocketsByJob,
  getDocketSummary
} from "../controllers/docket.controller";

import { validateRequest } from "../middlewares/validateRequest";

import {
  createDocketParamsSchema,
  createDocketBodySchema,
  getDocketsParamsSchema,
  getDocketsQuerySchema,
  docketSummarySchema
} from "../validators";

const router = Router();

// CREATE DOCKET FOR JOB
router.post(
  "/jobs/:jobId/dockets",
  validateRequest({
    params: createDocketParamsSchema,
    body: createDocketBodySchema
  }),
  createDocket
);

// LIST DOCKETS FOR A JOB
router.get(
  "/jobs/:jobId/dockets",
  validateRequest({
    params: getDocketsParamsSchema,
    query: getDocketsQuerySchema
  }),
  getDocketsByJob
);

// SUMMARY OF ALL DOCKETS
router.get(
  "/dockets/summary",
  validateRequest({ query: docketSummarySchema }), // optional, keeps structure clean
  getDocketSummary
);

export default router;
