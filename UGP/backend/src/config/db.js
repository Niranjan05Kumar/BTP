import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing database connection string! Please configure MONGO_URI (or MONGODB_URI) in your Render Service Environment variables."
    );
  }

  const dbName = process.env.MONGO_DB_NAME || "surface_mining_dashboard";
  console.log(`Connecting to MongoDB (database: ${dbName})...`);

  await mongoose.connect(mongoUri, {
    dbName,
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected successfully");
};

export default connectDB;
