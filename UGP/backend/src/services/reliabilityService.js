import DowntimeEvent from "../models/DowntimeEvent.js";
import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import { buildRangeMatch } from "./queryHelpers.js";

/**
 * Equipment Reliability Analysis Service (MTBF & MTTR)
 * Strictly utilizes qualifying unplanned breakdown events for failure counts.
 */

export const getReliabilityMetrics = async (filters) => {
  const range = buildRangeMatch(filters.start, filters.end);

  const shiftFilter = { ...range };
  const eventFilter = {
    ...range,
    isFailure: true, // Only qualifying unplanned breakdowns
  };

  if (filters.shift && filters.shift !== "all") {
    shiftFilter.shiftCode = filters.shift;
    eventFilter.shiftCode = filters.shift;
  }

  if (filters.type && filters.type !== "all") {
    shiftFilter.equipmentType = filters.type;
    eventFilter.equipmentType = filters.type;
  }

  if (filters.equipmentId && filters.equipmentId !== "all") {
    shiftFilter.equipmentId = filters.equipmentId;
    eventFilter.equipmentId = filters.equipmentId;
  }

  // 1. Operating hours per equipment
  const operatingHoursAgg = await ShiftEquipmentRecord.aggregate([
    { $match: shiftFilter },
    {
      $group: {
        _id: {
          equipmentId: "$equipmentId",
          equipmentType: "$equipmentType",
        },
        totalOperatingHours: { $sum: "$operatingHours" },
      },
    },
  ]);

  // 2. Qualifying breakdown events per equipment
  const failureEventsAgg = await DowntimeEvent.aggregate([
    { $match: eventFilter },
    {
      $group: {
        _id: "$equipmentId",
        failureCount: { $sum: 1 },
        totalRepairHours: { $sum: "$repairHours" },
        totalDowntimeHours: { $sum: "$downtimeHours" },
      },
    },
  ]);

  const failureMap = new Map(failureEventsAgg.map((f) => [f._id, f]));

  let grandTotalOperatingHours = 0;
  let grandTotalFailures = 0;
  let grandTotalRepairHours = 0;

  const equipmentReliability = operatingHoursAgg.map((item) => {
    const equipId = item._id.equipmentId;
    const equipType = item._id.equipmentType;
    const opHours = item.totalOperatingHours || 0;
    const failureData = failureMap.get(equipId) || {
      failureCount: 0,
      totalRepairHours: 0,
      totalDowntimeHours: 0,
    };

    const failures = failureData.failureCount;
    const repairHours = failureData.totalRepairHours;

    grandTotalOperatingHours += opHours;
    grandTotalFailures += failures;
    grandTotalRepairHours += repairHours;

    // MTBF = Operating Hours / Failures
    const mtbf = failures > 0 ? opHours / failures : opHours;
    // MTTR = Repair Hours / Failures
    const mttr = failures > 0 ? repairHours / failures : 0;
    // Failure Rate = Failures / (Operating Hours / 100)
    const failureRatePer100h = opHours > 0 ? (failures / opHours) * 100 : 0;

    return {
      equipmentId: equipId,
      equipmentType: equipType,
      operatingHours: Number(opHours.toFixed(2)),
      failures,
      repairHours: Number(repairHours.toFixed(2)),
      mtbfHours: Number(mtbf.toFixed(2)),
      mttrHours: Number(mttr.toFixed(2)),
      failureRatePer100h: Number(failureRatePer100h.toFixed(2)),
      status: failures > 3 ? "High Maintenance" : failures > 1 ? "Moderate" : "Good",
    };
  });

  // Subsystem failure breakdown
  const subSystemBreakdown = await DowntimeEvent.aggregate([
    { $match: eventFilter },
    {
      $group: {
        _id: "$subSystem",
        failureCount: { $sum: 1 },
        totalRepairHours: { $sum: "$repairHours" },
      },
    },
    {
      $project: {
        _id: 0,
        subSystem: "$_id",
        failureCount: "$failureCount",
        repairHours: { $round: ["$totalRepairHours", 2] },
      },
    },
    { $sort: { failureCount: -1 } },
  ]);

  const fleetMtbf = grandTotalFailures > 0 ? grandTotalOperatingHours / grandTotalFailures : grandTotalOperatingHours;
  const fleetMttr = grandTotalFailures > 0 ? grandTotalRepairHours / grandTotalFailures : 0;

  return {
    totalOperatingHours: Number(grandTotalOperatingHours.toFixed(2)),
    totalQualifyingFailures: grandTotalFailures,
    totalRepairHours: Number(grandTotalRepairHours.toFixed(2)),
    fleetMtbfHours: Number(fleetMtbf.toFixed(2)),
    fleetMttrHours: Number(fleetMttr.toFixed(2)),
    equipmentReliability: equipmentReliability.sort((a, b) => b.failures - a.failures),
    subSystemBreakdown,
  };
};

