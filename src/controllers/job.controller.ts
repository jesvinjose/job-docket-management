import { NextFunction, Request, Response } from "express";
import Job from "../models/job.model";
import { getNextSequence } from "../utils/getNextSequence";
import mongoose from "mongoose";
import Docket from "../models/docket.model";
import { sendApiResponse } from "../utils/sendApiResponse";
import { HttpError } from "../utils/httpError";

export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { clientName, siteLocation } = req.body;

    if (!clientName || !siteLocation) {
      throw new HttpError(400, "Missing required fields");
    }

    // 1. Generate next sequence safely
    const seq = await getNextSequence("JOB", session);

    // 2. Format jobNumber
    const jobNumber = `JOB-${seq.toString().padStart(4, "0")}`;

    // 3. Create job with generated number
    const job = await Job.create([{ jobNumber, clientName, siteLocation }], {
      session,
    });

    await session.commitTransaction();

    return sendApiResponse(res, 201, true, "Job created successfully", {
      data: job[0],
      is_show: true,
    });
  } catch (err: any) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const getAllJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    const jobs = await Job.find(filter)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    const totalCount = await Job.countDocuments(filter);

    return sendApiResponse(res, 200, true, "Jobs fetched successfully", {
      data: jobs,
      pagination: {
        totalCount,
        currentPage: +page,
        totalPages: Math.ceil(totalCount / +limit),
        hasNextPage: +page * +limit < totalCount,
        hasPreviousPage: +page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      if (!job) throw new HttpError(404, "Job not found");
    }

    const dockets = await Docket.find({ jobId: id }).sort({ date: -1 });

    return sendApiResponse(res, 200, true, "Job fetched successfully", {
      data: { job, dockets },
      is_show: true,
    });
  } catch (err) {
    next(err);
  }
};

export const closeJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      throw new HttpError(404, "Job not found");
    }

    job.status = "closed";
    await job.save();

    return sendApiResponse(res, 200, true, "Job closed successfully", {
      data: job,
      is_show: true,
    });
  } catch (err) {
    next(err);
  }
};
