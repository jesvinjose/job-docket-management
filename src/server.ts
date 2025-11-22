import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDb from "./config/db";

import jobRoutes from "./routes/job.routes";
import docketRoutes from "./routes/docket.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { sendApiResponse } from "./utils/sendApiResponse";

const app = express();

// Database connection
connectDb();

// Basic middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check route
app.get("/active", (req, res) => {
  res.json({ message: "Job-Docket API is running" });
});

// Routes
app.use("/jobs", jobRoutes);
app.use("/dockets", docketRoutes);

// 404 handler
app.use((req, res) =>
  sendApiResponse(res, 404, false, "Route not found", { is_show: true })
);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

// Server start
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
