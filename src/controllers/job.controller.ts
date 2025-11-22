import { Request, Response } from "express";
import Job from "../models/job.model";
import { getNextSequence } from "../utils/getNextSequence";
import mongoose from "mongoose";
import Docket from "../models/docket.model";
import { sendApiResponse } from "../utils/sendApiResponse";

export const createJob = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { clientName, siteLocation } = req.body;

    if (!clientName || !siteLocation) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
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
    session.endSession();

    return sendApiResponse(res, 201, true, "Job created successfully", {
      data: job[0],
      is_show: true,
    });
  } catch (err: any) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    return sendApiResponse(res, 500, false, err?.message || "Server error", {
      is_show: true,
    });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
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
    console.error(err);
    return sendApiResponse(res, 500, false, "Server error", {
      is_show: true,
    });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ status: false, message: "Job not found" });
    }

    const dockets = await Docket.find({ jobId: id }).sort({ date: -1 });

    return sendApiResponse(res, 200, true, "Job fetched successfully", {
      data: { job, dockets },
      is_show: true,
    });
  } catch (err) {
    console.error(err);
    return sendApiResponse(res, 500, false, "Server error", {
      is_show: true,
    });
  }
};

export const closeJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ status: false, message: "Job not found" });
    }

    job.status = "closed";
    await job.save();

    return sendApiResponse(res, 200, true, "Job closed successfully", {
      data: job,
      is_show: true,
    });
  } catch (err) {
    console.error(err);
    return sendApiResponse(res, 500, false, "Server error", {
      is_show: true,
    });
  }
};
