import { Request, Response } from "express";
import Job from "../models/job.model";
import Docket from "../models/docket.model";
import { parseDDMMYYYY } from "../utils/dateParser";
import { sendApiResponse } from "../utils/sendApiResponse";

export const createDocket = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { supervisorName, date, labourItems, notes } = req.body;

    // Check job
    const job = await Job.findById(jobId);
    if (!job) {
      return sendApiResponse(res, 404, false, "Job not found", {
        is_show: true,
      });
    }

    if (job.status === "closed") {
      return sendApiResponse(
        res,
        409,
        false,
        "Job is closed. Cannot create docket.",
        { is_show: true }
      );
    }

    // Validate required fields
    if (
      !supervisorName ||
      !date ||
      !labourItems ||
      !Array.isArray(labourItems)
    ) {
      return sendApiResponse(res, 400, false, "Missing required fields", {
        is_show: true,
      });
    }

    if (labourItems.length === 0) {
      return sendApiResponse(res, 400, false, "labourItems cannot be empty", {
        is_show: true,
      });
    }

    labourItems.forEach((item) => {
      if (!item.workerName || !item.role || item.hoursWorked <= 0) {
        return sendApiResponse(res, 400, false, "Invalid labour item", {
          is_show: true,
        });
      }
    });

    // Convert date
    const parsedDate = parseDDMMYYYY(date);
    if (!parsedDate) {
      return sendApiResponse(res, 400, false, "Invalid date format", {
        is_show: true,
      });
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
    console.error(err);
    return sendApiResponse(res, 500, false, err?.message || "Server error", {
      is_show: true,
    });
  }
};

export const getDocketsByJob = async (req: Request, res: Response) => {
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
    console.error(err);
    return sendApiResponse(res, 500, false, "Server error", {
      is_show: true,
    });
  }
};

export const getDocketSummary = async (_req: Request, res: Response) => {
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
    console.error(err);
    return sendApiResponse(res, 500, false, "Server error", {
      is_show: true,
    });
  }
};
