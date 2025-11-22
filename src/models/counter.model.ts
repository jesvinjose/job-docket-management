import mongoose, { Schema } from "mongoose";

const CounterSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "JOB"
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Counter = mongoose.model("Counter", CounterSchema);
