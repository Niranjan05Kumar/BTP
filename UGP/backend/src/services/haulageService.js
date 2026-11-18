import HaulageCycleRecord from "../models/HaulageCycleRecord.js";
import { buildRangeMatch } from "./queryHelpers.js";

/**
 * Haulage Cycle-Time & Kinematic Analysis Service
 */

export const getHaulageSummary = async (filters) => {
  const match = {
    ...buildRangeMatch(filters.start, filters.end),
  };

  if (filters.shift && filters.shift !== "all") {
    match.shiftCode = filters.shift;
  }

  if (filters.dumperId && filters.dumperId !== "all") {
    match.dumperId = filters.dumperId;
  }

  if (filters.shovelId && filters.shovelId !== "all") {
    match.shovelId = filters.shovelId;
  }

  const [summary] = await HaulageCycleRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalPayload: { $sum: "$payloadTonnage" },
        avgQueueWait: { $avg: "$queueWaitMinutes" },
        avgSpotLoad: { $avg: "$spotLoadMinutes" },
        avgLoadedTravel: { $avg: "$loadedTravelMinutes" },
        avgSpotDump: { $avg: "$spotDumpMinutes" },
        avgEmptyReturn: { $avg: "$emptyReturnMinutes" },
        avgTotalCycle: { $avg: "$totalCycleMinutes" },
      },
    },
  ]);

  if (!summary) {
    return {
      totalTrips: 0,
      totalPayloadTonnes: 0,
      averagePayloadTonnes: 0,
      averageCycleMinutes: 0,
      queueWaitMinutes: 0,
      spotLoadMinutes: 0,
      loadedTravelMinutes: 0,
      spotDumpMinutes: 0,
      emptyReturnMinutes: 0,
      queueContributionPercent: 0,
      dumperHourlyProductivity: 0,
    };
  }

  const avgTotal = summary.avgTotalCycle || 0;
  const avgQueue = summary.avgQueueWait || 0;
  const avgPayload = summary.totalTrips > 0 ? summary.totalPayload / summary.totalTrips : 0;
  const queueRatio = avgTotal > 0 ? (avgQueue / avgTotal) * 100 : 0;
  const hourlyProductivity = avgTotal > 0 ? (avgPayload * 60) / avgTotal : 0;

  return {
    totalTrips: summary.totalTrips,
    totalPayloadTonnes: Number(summary.totalPayload.toFixed(2)),
    averagePayloadTonnes: Number(avgPayload.toFixed(2)),
    averageCycleMinutes: Number(avgTotal.toFixed(2)),
    queueWaitMinutes: Number(avgQueue.toFixed(2)),
    spotLoadMinutes: Number((summary.avgSpotLoad || 0).toFixed(2)),
    loadedTravelMinutes: Number((summary.avgLoadedTravel || 0).toFixed(2)),
    spotDumpMinutes: Number((summary.avgSpotDump || 0).toFixed(2)),
    emptyReturnMinutes: Number((summary.avgEmptyReturn || 0).toFixed(2)),
    queueContributionPercent: Number(queueRatio.toFixed(2)),
    dumperHourlyProductivity: Number(hourlyProductivity.toFixed(2)),
  };
};

export const getHaulageByDumper = async (filters) => {
  const match = {
    ...buildRangeMatch(filters.start, filters.end),
  };

  if (filters.shift && filters.shift !== "all") {
    match.shiftCode = filters.shift;
  }

  return HaulageCycleRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$dumperId",
        trips: { $sum: 1 },
        totalTonnage: { $sum: "$payloadTonnage" },
        avgQueueWait: { $avg: "$queueWaitMinutes" },
        avgSpotLoad: { $avg: "$spotLoadMinutes" },
        avgLoadedTravel: { $avg: "$loadedTravelMinutes" },
        avgSpotDump: { $avg: "$spotDumpMinutes" },
        avgEmptyReturn: { $avg: "$emptyReturnMinutes" },
        avgCycleTime: { $avg: "$totalCycleMinutes" },
      },
    },
    {
      $project: {
        _id: 0,
        dumperId: "$_id",
        trips: "$trips",
        totalTonnage: { $round: ["$totalTonnage", 2] },
        avgPayload: { $round: [{ $divide: ["$totalTonnage", "$trips"] }, 2] },
        avgQueueWait: { $round: ["$avgQueueWait", 2] },
        avgSpotLoad: { $round: ["$avgSpotLoad", 2] },
        avgLoadedTravel: { $round: ["$avgLoadedTravel", 2] },
        avgSpotDump: { $round: ["$avgSpotDump", 2] },
        avgEmptyReturn: { $round: ["$avgEmptyReturn", 2] },
        avgCycleTime: { $round: ["$avgCycleTime", 2] },
        queuePercent: {
          $round: [
            {
              $multiply: [
                {
                  $cond: [
                    { $eq: ["$avgCycleTime", 0] },
                    0,
                    { $divide: ["$avgQueueWait", "$avgCycleTime"] },
                  ],
                },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
    { $sort: { dumperId: 1 } },
  ]);
};

