import mongoose from "mongoose";

const shiftEquipmentRecordSchema = new mongoose.Schema(
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
      enum: ["dumper", "shovel", "dozer", "drill"],
      index: true,
    },
    materialTonnage: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    trips: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    operatingHours: {
      type: Number,
      required: true,
      min: 0,
      max: 8,
      default: 0,
    },
    downtimeHours: {
      type: Number,
      required: true,
      min: 0,
      max: 8,
      default: 0,
    },
    downtimeReason: {
      type: String,
      required: true,
      default: "None",
      trim: true,
    },
    fuelLiters: {
      type: Number,
      min: 0,
      default: 0,
    },
    operatingCost: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

shiftEquipmentRecordSchema.index({ date: 1, shiftCode: 1, equipmentId: 1 });

const ShiftEquipmentRecord = mongoose.model("ShiftEquipmentRecord", shiftEquipmentRecordSchema);

export default ShiftEquipmentRecord;
