import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in environment variables.");
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || "surface_mining_dashboard",
  });

  console.log("MongoDB connected successfully");
};

export default connectDB;
