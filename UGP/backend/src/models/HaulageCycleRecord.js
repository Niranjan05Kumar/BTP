import mongoose from "mongoose";

const haulageCycleRecordSchema = new mongoose.Schema(
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
    dumperId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    shovelId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    materialId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    payloadTonnage: {
      type: Number,
      required: true,
      min: 0,
    },
    queueWaitMinutes: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    spotLoadMinutes: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    loadedTravelMinutes: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    spotDumpMinutes: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    emptyReturnMinutes: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalCycleMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    dataSource: {
      type: String,
      default: "synthetic_simulation",
      enum: ["synthetic_simulation", "field_telemetry"],
    },
  },
  { timestamps: true }
);

haulageCycleRecordSchema.index({ date: 1, shiftCode: 1, dumperId: 1 });
haulageCycleRecordSchema.index({ date: 1, shovelId: 1 });
haulageCycleRecordSchema.index({ date: 1, materialId: 1 });

const HaulageCycleRecord = mongoose.model(
  "HaulageCycleRecord",
  haulageCycleRecordSchema
);

export default HaulageCycleRecord;

