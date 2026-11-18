import DowntimeEvent from "../models/DowntimeEvent.js";
import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import { buildRangeMatch } from "./queryHelpers.js";

/**
 * Downtime & Operational Delays Analysis Service
 */

export const getDowntimeByReason = async (filters) => {
  const match = {
    ...buildRangeMatch(filters.start, filters.end),
  };

  if (filters.shift && filters.shift !== "all") {
    match.shiftCode = filters.shift;
  }

  if (filters.type && filters.type !== "all") {
    match.equipmentType = filters.type;
  }

  if (filters.equipmentId && filters.equipmentId !== "all") {
    match.equipmentId = filters.equipmentId;
  }

  return DowntimeEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$reason",
        category: { $first: "$category" },
        subSystem: { $first: "$subSystem" },
        downtimeHours: { $sum: "$downtimeHours" },
        repairHours: { $sum: "$repairHours" },
        eventCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        reason: "$_id",
        category: "$category",
        subSystem: "$subSystem",
        downtimeHours: { $round: ["$downtimeHours", 2] },
        repairHours: { $round: ["$repairHours", 2] },
        eventCount: "$eventCount",
      },
    },
    { $sort: { downtimeHours: -1 } },
  ]);
};

export const getDowntimeByCategory = async (filters) => {
  const match = {
    ...buildRangeMatch(filters.start, filters.end),
  };

  if (filters.shift && filters.shift !== "all") {
    match.shiftCode = filters.shift;
  }

  if (filters.type && filters.type !== "all") {
    match.equipmentType = filters.type;
  }

  return DowntimeEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$category",
        downtimeHours: { $sum: "$downtimeHours" },
        repairHours: { $sum: "$repairHours" },
        eventCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        downtimeHours: { $round: ["$downtimeHours", 2] },
        repairHours: { $round: ["$repairHours", 2] },
        eventCount: "$eventCount",
      },
    },
    { $sort: { downtimeHours: -1 } },
  ]);
};

export const getDowntimeBySubSystem = async (filters) => {
  const match = {
    ...buildRangeMatch(filters.start, filters.end),
  };

  if (filters.type && filters.type !== "all") {
    match.equipmentType = filters.type;
  }

  return DowntimeEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$subSystem",
        downtimeHours: { $sum: "$downtimeHours" },
        eventCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        subSystem: "$_id",
        downtimeHours: { $round: ["$downtimeHours", 2] },
        eventCount: "$eventCount",
      },
    },
    { $sort: { downtimeHours: -1 } },
  ]);
};

