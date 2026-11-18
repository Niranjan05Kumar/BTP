import mongoose from "mongoose";

const downtimeEventSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    shiftCode: {
      type: String,
      required: true,
      enum: ["A", "B", "C"],
      index: true,
    },
    equipmentId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    equipmentType: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Planned Maintenance", "Unplanned Breakdown", "Operational Delay"],
      index: true,
    },
    subSystem: {
      type: String,
      default: "General",
      enum: [
        "Engine",
        "Hydraulics",
        "Transmission",
        "Electrical",
        "Tires & Tracks",
        "Structural",
        "Operational",
        "Weather",
        "General",
      ],
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    downtimeHours: {
      type: Number,
      required: true,
      min: 0.1,
      max: 24,
    },
    repairHours: {
      type: Number,
      default: 0,
      min: 0,
      max: 24,
    },
    isFailure: {
      type: Boolean,
      required: true,
      default: false,
      index: true, // Qualifying failure for MTBF
    },
    dataSource: {
      type: String,
      default: "synthetic_simulation",
      enum: ["synthetic_simulation", "field_telemetry"],
    },
  },
  { timestamps: true }
);

downtimeEventSchema.index({ equipmentId: 1, date: 1, isFailure: 1 });
downtimeEventSchema.index({ category: 1, date: 1 });
downtimeEventSchema.index({ equipmentType: 1, date: 1 });

const DowntimeEvent = mongoose.model("DowntimeEvent", downtimeEventSchema);

export default DowntimeEvent;

