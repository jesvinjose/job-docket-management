import { Counter } from "../models/counter.model";

export const getNextSequence = async (name: string, session: any) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  return counter.seq;
};
