import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDb from "./config/db";

import jobRoutes from "./routes/job.routes";
import docketRoutes from "./routes/docket.routes";

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
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ status: false, message: "Internal Server Error" });
});

// Server start
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
