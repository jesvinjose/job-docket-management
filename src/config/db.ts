import mongoose from "mongoose";

const mongodb_connection_string: string = process.env.DATABASE_URL as string;

// Enable strict querying
mongoose.set("strictQuery", true);

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(mongodb_connection_string, {
      autoIndex: false, // Disable auto-indexing
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
