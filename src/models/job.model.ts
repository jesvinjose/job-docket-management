import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  jobNumber: string;
  clientName: string;
  siteLocation: string;
  status: "open" | "closed";
  createdAt: Date;
}

const JobSchema = new Schema<IJob>({
  jobNumber: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  siteLocation: { type: String, required: true },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  createdAt: { type: Date, default: () => new Date() },
});

const Job = mongoose.model<IJob>("Job", JobSchema);
export default Job;
