import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["dumper", "shovel", "dozer", "drill"],
    },
    capacityTon: {
      type: Number,
      min: 0,
      required: true,
    },
    status: {
      type: String,
      default: "active",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const Equipment = mongoose.model("Equipment", equipmentSchema);

export default Equipment;
