import HaulageCycleRecord from "../models/HaulageCycleRecord.js";
import Equipment from "../models/Equipment.js";
import { buildRangeMatch } from "./queryHelpers.js";

/**
 * Shovel-Dumper Matching & Fleet Compatibility Service
 */

export const getFleetMatchingAnalysis = async (filters) => {
  const match = {
    ...buildRangeMatch(filters.start, filters.end),
  };

  if (filters.shift && filters.shift !== "all") {
    match.shiftCode = filters.shift;
  }

  // Aggregate cycle metrics grouped by Shovel-Dumper pairing
  const pairAggregates = await HaulageCycleRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          shovelId: "$shovelId",
          dumperId: "$dumperId",
        },
        trips: { $sum: 1 },
        avgQueueWait: { $avg: "$queueWaitMinutes" },
        avgSpotLoad: { $avg: "$spotLoadMinutes" },
        avgTotalCycle: { $avg: "$totalCycleMinutes" },
        avgPayload: { $avg: "$payloadTonnage" },
      },
    },
  ]);

  // Aggregate cycle metrics grouped by Shovel alone
  const shovelAggregates = await HaulageCycleRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$shovelId",
        activeDumpers: { $addToSet: "$dumperId" },
        totalTrips: { $sum: 1 },
        avgQueueWait: { $avg: "$queueWaitMinutes" },
        avgSpotLoad: { $avg: "$spotLoadMinutes" },
        avgTotalCycle: { $avg: "$totalCycleMinutes" },
        avgPayload: { $avg: "$payloadTonnage" },
      },
    },
  ]);

  const equipmentList = await Equipment.find({
    type: { $in: ["shovel", "wheel_loader", "dumper"] },
  }).lean();

  const equipMap = new Map(equipmentList.map((e) => [e.equipmentId, e]));

  const matchingResults = shovelAggregates.map((sh) => {
    const shovelId = sh._id;
    const shovelSpec = equipMap.get(shovelId) || { bucketCapacityM3: 8.5, capacityTon: 25 };
    const numDumpers = sh.activeDumpers.length;
    const tl = sh.avgSpotLoad || 3.5; // Shovel loading time per truck in min
    const tc = sh.avgTotalCycle || 24.0; // Total truck cycle time in min

    // Match Factor: MF = (Nd * tl) / (Ns * Tc) with Ns = 1
    const matchFactor = tc > 0 ? (numDumpers * tl) / (1.0 * tc) : 0;

    let status = "Balanced";
    let statusColor = "var(--success)";
    let recommendation = "Fleet synchronization is near-optimal.";

    if (matchFactor < 0.85) {
      status = "Under-Trucked";
      statusColor = "var(--warning)";
      recommendation = "Shovel is starved. Allocate 1-2 additional dumpers to maximize excavator utilization.";
    } else if (matchFactor > 1.05) {
      status = "Over-Trucked";
      statusColor = "var(--danger)";
      recommendation = "Excess dumpers causing bench queue bunching. Consider reallocating dumpers to longer hauls.";
    }

    // Typical pass count estimation
    const bucketTonnes = (shovelSpec.bucketCapacityM3 || 8.5) * 1.8;
    const avgDumperPayload = sh.avgPayload || 55;
    const estimatedPasses = bucketTonnes > 0 ? Math.ceil(avgDumperPayload / bucketTonnes) : 4;

    return {
      shovelId,
      shovelModel: shovelSpec.makeModel || "Hydraulic Excavator",
      bucketCapacityM3: shovelSpec.bucketCapacityM3 || 0,
      activeDumpersCount: numDumpers,
      activeDumperList: sh.activeDumpers,
      avgLoadingTimeMinutes: Number(tl.toFixed(2)),
      avgCycleTimeMinutes: Number(tc.toFixed(2)),
      avgQueueWaitMinutes: Number((sh.avgQueueWait || 0).toFixed(2)),
      matchFactor: Number(matchFactor.toFixed(3)),
      status,
      statusColor,
      recommendation,
      estimatedPasses,
      avgPayloadTonnes: Number(avgDumperPayload.toFixed(2)),
      totalTrips: sh.totalTrips,
    };
  });

  return matchingResults;
};

