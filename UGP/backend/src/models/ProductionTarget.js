import mongoose from "mongoose";

const productionTargetSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
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

const ProductionTarget = mongoose.model("ProductionTarget", productionTargetSchema);

export default ProductionTarget;
