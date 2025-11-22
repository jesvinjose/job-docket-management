import { NextFunction, Request, Response } from "express";
import Job from "../models/job.model";
import Docket from "../models/docket.model";
import { parseDDMMYYYY } from "../utils/dateParser";
import { sendApiResponse } from "../utils/sendApiResponse";
import { HttpError } from "../utils/httpError";

export const createDocket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;
    const { supervisorName, date, labourItems, notes } = req.body;

    // Check job
    const job = await Job.findById(jobId);
    if (!job) {
      throw new HttpError(404, "Job not found");
    }

    if (job.status === "closed") {
      throw new HttpError(409, "Job is closed. Cannot create docket.");
    }

    // Validate required fields
    if (
      !supervisorName ||
      !date ||
      !labourItems ||
      !Array.isArray(labourItems)
    ) {
      throw new HttpError(400, "Missing required fields");
    }

    if (labourItems.length === 0) {
      throw new HttpError(400, "labourItems cannot be empty");
    }

    labourItems.forEach((item) => {
      if (!item.workerName || !item.role || item.hoursWorked <= 0) {
        throw new HttpError(400, "Invalid labour item");
      }
    });

    // Convert date
    const parsedDate = parseDDMMYYYY(date);
    if (!parsedDate) {
      throw new HttpError(400, "Invalid date format. Must be DD-MM-YYYY");
    }

    const docket = await Docket.create({
      jobId,
      supervisorName,
      date: parsedDate,
      labourItems,
      notes,
    });

    return sendApiResponse(res, 201, true, "Docket created successfully", {
      data: docket,
      is_show: true,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getDocketsByJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;
    const { from, to, supervisorName } = req.query;

    const filter: any = { jobId };

    // Date range filter
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = parseDDMMYYYY(from as string);
      if (to) filter.date.$lte = parseDDMMYYYY(to as string);
    }

    // Supervisor filter
    if (supervisorName) {
      filter.supervisorName = {
        $regex: new RegExp(supervisorName as string, "i"),
      };
    }

    const dockets = await Docket.find(filter).sort({ date: -1 });

    return sendApiResponse(res, 200, true, "Dockets fetched successfully", {
      data: dockets,
    });
  } catch (err) {
    next(err);
  }
};

export const getDocketSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const totalDockets = await Docket.countDocuments();

    // Aggregate total hours by role
    const result = await Docket.aggregate([
      { $unwind: "$labourItems" },
      {
        $group: {
          _id: "$labourItems.role",
          totalHours: { $sum: "$labourItems.hoursWorked" },
        },
      },
    ]);

    const totalHoursByRole: any = {};
    result.forEach((r) => {
      totalHoursByRole[r._id] = r.totalHours;
    });

    return sendApiResponse(
      res,
      200,
      true,
      "Docket summary fetched successfully",
      {
        data: {
          totalDockets,
          totalHoursByRole,
        },
      }
    );
  } catch (err) {
    next(err);
  }
};
