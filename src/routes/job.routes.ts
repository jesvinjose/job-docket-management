import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  closeJob
} from "../controllers/job.controller";

import { validateRequest } from "../middlewares/validateRequest";

import {
  createJobSchema,
  listJobsQuerySchema,
  jobIdParamSchema,
  closeJobParamSchema
} from "../validators";

const router = Router();

// CREATE JOB
router.post(
  "/",
  validateRequest({ body: createJobSchema }),
  createJob
);

// LIST JOBS WITH QUERY VALIDATION
router.get(
  "/",
  validateRequest({ query: listJobsQuerySchema }),
  getAllJobs
);

// GET JOB BY ID
router.get(
  "/:id",
  validateRequest({ params: jobIdParamSchema }),
  getJobById
);

// CLOSE JOB
router.patch(
  "/:id/close",
  validateRequest({ params: closeJobParamSchema }),
  closeJob
);

export default router;
