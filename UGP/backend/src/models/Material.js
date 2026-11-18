import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    materialId: {
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
    category: {
      type: String,
      required: true,
      enum: ["Ore", "Mineral", "Overburden", "Waste", "Topsoil"],
      index: true,
    },
    densityInSitu: {
      type: Number,
      required: true,
      min: 0.5,
      max: 5.0, // tonnes per cubic meter (t/m³)
    },
    swellFactor: {
      type: Number,
      required: true,
      min: 1.0,
      max: 2.0,
      default: 1.25,
    },
    defaultUnit: {
      type: String,
      default: "tonnes",
      enum: ["tonnes", "BCM"],
    },
  },
  { timestamps: true }
);

materialSchema.index({ materialId: 1, category: 1 });

const Material = mongoose.model("Material", materialSchema);

export default Material;

