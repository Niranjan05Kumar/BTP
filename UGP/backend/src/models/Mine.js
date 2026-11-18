import mongoose from "mongoose";

const mineSchema = new mongoose.Schema(
  {
    mineId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mineralType: {
      type: String,
      required: true,
      enum: ["Coal", "Iron Ore", "Bauxite", "Limestone", "Copper", "Multi-Mineral"],
    },
    location: {
      state: { type: String, required: true, trim: true },
      country: { type: String, default: "India", trim: true },
    },
    scheduledShiftHours: {
      type: Number,
      default: 8.0,
      min: 4,
      max: 12,
    },
    shiftsPerDay: {
      type: Number,
      default: 3,
      min: 1,
      max: 4,
    },
  },
  { timestamps: true }
);

const Mine = mongoose.model("Mine", mineSchema);

export default Mine;

