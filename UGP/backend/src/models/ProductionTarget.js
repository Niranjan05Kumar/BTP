import mongoose from "mongoose";

const productionTargetSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    shiftCode: {
      type: String,
      enum: ["A", "B", "C", "ALL"],
      default: "ALL",
      index: true,
    },
    materialCategory: {
      type: String,
      enum: ["Mineral", "Overburden", "Total"],
      default: "Total",
      index: true,
    },
    targetTonnage: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

productionTargetSchema.index(
  { date: 1, shiftCode: 1, materialCategory: 1 },
  { unique: true }
);

const ProductionTarget = mongoose.model("ProductionTarget", productionTargetSchema);

export default ProductionTarget;
