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
      enum: [
        "dumper",
        "shovel",
        "wheel_loader",
        "dozer",
        "drill",
        "motor_grader",
        "water_tanker",
      ],
      index: true,
    },
    makeModel: {
      type: String,
      default: "",
      trim: true,
    },
    capacityTon: {
      type: Number,
      min: 0,
      required: true,
    },
    bucketCapacityM3: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratedPowerHp: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "standby", "under_maintenance", "decommissioned"],
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

equipmentSchema.index({ equipmentId: 1, type: 1, status: 1 });

const Equipment = mongoose.model("Equipment", equipmentSchema);

export default Equipment;
