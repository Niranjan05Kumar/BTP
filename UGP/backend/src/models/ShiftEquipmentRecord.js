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
    materialId: {
      type: String,
      default: "COAL",
      trim: true,
      index: true,
    },
    materialCategory: {
      type: String,
      default: "Mineral",
      enum: ["Ore", "Mineral", "Overburden", "Waste", "Topsoil", "Support"],
      index: true,
    },
    materialTonnage: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    volumeBcm: {
      type: Number,
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
    idleHours: {
      type: Number,
      required: true,
      min: 0,
      max: 8,
      default: 0,
    },
    maintenanceHours: {
      type: Number,
      required: true,
      min: 0,
      max: 8,
      default: 0,
    },
    downtimeHours: {
      // Maintained for backward compatibility with existing controllers/aggregations
      type: Number,
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
    primaryDowntimeReason: {
      type: String,
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
    dataSource: {
      type: String,
      default: "synthetic_simulation",
      enum: ["synthetic_simulation", "public_benchmark", "field_telemetry"],
      index: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure downtimeHours mirrors maintenanceHours + primary downtime sync
shiftEquipmentRecordSchema.pre("save", function (next) {
  if (this.downtimeHours === 0 && this.maintenanceHours > 0) {
    this.downtimeHours = this.maintenanceHours;
  }
  if (!this.primaryDowntimeReason || this.primaryDowntimeReason === "None") {
    this.primaryDowntimeReason = this.downtimeReason;
  }
  next();
});

// Compound indexes for rapid analytics
shiftEquipmentRecordSchema.index({ date: 1, shiftCode: 1, equipmentType: 1 });
shiftEquipmentRecordSchema.index({ date: 1, equipmentId: 1 });
shiftEquipmentRecordSchema.index({ date: 1, materialCategory: 1 });
shiftEquipmentRecordSchema.index({ date: 1, shiftCode: 1, equipmentId: 1 });

const ShiftEquipmentRecord = mongoose.model(
  "ShiftEquipmentRecord",
  shiftEquipmentRecordSchema
);

export default ShiftEquipmentRecord;
