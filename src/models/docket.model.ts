import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILabourItem {
  workerName: string;
  role: string;
  hoursWorked: number;
}

export interface IDocket extends Document {
  jobId: Types.ObjectId;
  supervisorName: string;
  date: Date;
  labourItems: ILabourItem[];
  notes?: string;
  createdAt: Date;
}

const LabourItemSchema = new Schema<ILabourItem>({
  workerName: { type: String, required: true },
  role: { type: String, required: true },
  hoursWorked: { type: Number, required: true },
});

const DocketSchema = new Schema<IDocket>({
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  supervisorName: { type: String, required: true },
  date: { type: Date, required: true }, // stored as Date not DD-MM-YYYY
  labourItems: { type: [LabourItemSchema], required: true },
  notes: { type: String },
  createdAt: { type: Date, default: () => new Date() },
});

const Docket = mongoose.model<IDocket>("Docket", DocketSchema);
export default Docket;
