import mongoose from "mongoose";

const mineProductionRecordSchema = new mongoose.Schema(
  {
    sourceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    mineName: {
      type: String,
      required: true,
      trim: true,
    },
    mineral: {
      type: String,
      required: true,
      trim: true,
    },
    fiscalYear: {
      type: String,
      required: true,
      trim: true,
    },
    reportingMonth: {
      type: String,
      required: true,
      trim: true,
    },
    productionTonnage: {
      type: Number,
      required: true,
      min: 0,
    },
    overburdenVolumeBcm: {
      type: Number,
      min: 0,
      default: 0,
    },
    strippingRatio: {
      type: Number,
      min: 0,
      default: 0,
    },
    averageAvailabilityPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    averageUtilizationPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    dataSource: {
      type: String,
      default: "public_benchmark",
      index: true,
    },
    sourceUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

mineProductionRecordSchema.index({
  organization: 1,
  mineName: 1,
  fiscalYear: 1,
});

const MineProductionRecord = mongoose.model(
  "MineProductionRecord",
  mineProductionRecordSchema
);

export default MineProductionRecord;

