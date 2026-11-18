import mongoose from "mongoose";

const dataSourceSchema = new mongoose.Schema(
  {
    sourceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sourceName: {
      type: String,
      required: true,
      trim: true,
    },
    sourceType: {
      type: String,
      required: true,
      enum: ["public_benchmark", "synthetic_simulation", "field_telemetry"],
      index: true,
    },
    publisher: {
      type: String,
      default: "",
      trim: true,
    },
    reportingPeriod: {
      type: String,
      default: "",
      trim: true,
    },
    referenceUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

dataSourceSchema.index({ sourceId: 1, sourceType: 1 });

const DataSource = mongoose.model("DataSource", dataSourceSchema);

export default DataSource;

