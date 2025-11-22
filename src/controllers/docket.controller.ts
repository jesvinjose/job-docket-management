import { Request, Response } from "express";
import Job from "../models/job.model";
import Docket from "../models/docket.model";
import { parseDDMMYYYY } from "../utils/dateParser";

export const createDocket = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { supervisorName, date, labourItems, notes } = req.body;

    // Check job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ status: false, message: "Job not found" });
    }

    if (job.status === "closed") {
      return res.status(409).json({ status: false, message: "Job is closed. Cannot create docket." });
    }

    // Validate required fields
    if (!supervisorName || !date || !labourItems || !Array.isArray(labourItems)) {
      return res.status(400).json({ status: false, message: "Missing required fields" });
    }

    if (labourItems.length === 0) {
      return res.status(400).json({ status: false, message: "labourItems cannot be empty" });
    }

    labourItems.forEach((item) => {
      if (!item.workerName || !item.role || item.hoursWorked <= 0) {
        throw new Error("Invalid labour item");
      }
    });

    // Convert date
    const parsedDate = parseDDMMYYYY(date);
    if (!parsedDate) {
      return res.status(400).json({ status: false, message: "Invalid date format" });
    }

    const docket = await Docket.create({
      jobId,
      supervisorName,
      date: parsedDate,
      labourItems,
      notes,
    });

    res.status(201).json({ status: true, docket });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message || "Server error" });
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
      filter.supervisorName = { $regex: new RegExp(supervisorName as string, "i") };
    }

    const dockets = await Docket.find(filter).sort({ date: -1 });

    res.json({ status: true, dockets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
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

    res.json({
      status: true,
      totalDockets,
      totalHoursByRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
