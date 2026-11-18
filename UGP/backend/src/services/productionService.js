import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import ProductionTarget from "../models/ProductionTarget.js";
import { buildFilteredMatch, buildRangeMatch } from "./queryHelpers.js";

/**
 * Production Performance Calculation Service
 * Enforces canonical dumper delivered tonnage boundary to eliminate double-counting.
 */

export const getDailyProduction = async (filters) => {
  const match = buildFilteredMatch(filters);

  // If type is not explicitly filtered, use dumper delivery as canonical mine production
  if (!filters.type || filters.type === "all") {
    match.equipmentType = "dumper";
  }

  return ShiftEquipmentRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        actual: { $sum: "$materialTonnage" },
        volumeBcm: { $sum: "$volumeBcm" },
        trips: { $sum: "$trips" },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        actual: { $round: ["$actual", 2] },
        volumeBcm: { $round: ["$volumeBcm", 2] },
        trips: "$trips",
      },
    },
    { $sort: { date: 1 } },
  ]);
};

export const getDailyProductionWithTarget = async (filters) => {
  const [actual, targets] = await Promise.all([
    getDailyProduction(filters),
    ProductionTarget.aggregate([
      {
        $match: {
          ...buildRangeMatch(filters.start, filters.end),
          shiftCode: filters.shift && filters.shift !== "all" ? filters.shift : "ALL",
        },
      },
      {
        $project: {
          _id: 0,
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          target: "$targetTonnage",
        },
      },
      { $sort: { date: 1 } },
    ]),
  ]);

  const targetMap = new Map(targets.map((item) => [item.date, item.target]));

  return actual.map((item) => {
    let target = targetMap.get(item.date);
    // If shift is filtered but specific shift target wasn't found, prorate 24-hr target by 1/3
    if (target === undefined && filters.shift && filters.shift !== "all") {
      const fallback24h = targetMap.get(item.date) || 0;
      target = fallback24h / 3;
    }

    return {
      date: item.date,
      actual: item.actual,
      target: Number((target || 0).toFixed(2)),
      variance: Number((item.actual - (target || 0)).toFixed(2)),
      attainment: target ? Number(((item.actual / target) * 100).toFixed(2)) : 0,
    };
  });
};

export const getShiftProduction = async (filters) => {
  const match = buildFilteredMatch(filters);

  if (!filters.type || filters.type === "all") {
    match.equipmentType = "dumper";
  }

  return ShiftEquipmentRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$shiftCode",
        production: { $sum: "$materialTonnage" },
        volumeBcm: { $sum: "$volumeBcm" },
        trips: { $sum: "$trips" },
      },
    },
    {
      $project: {
        _id: 0,
        shiftCode: "$_id",
        production: { $round: ["$production", 2] },
        volumeBcm: { $round: ["$volumeBcm", 2] },
        trips: "$trips",
      },
    },
    { $sort: { shiftCode: 1 } },
  ]);
};

export const getMaterialProduction = async (filters) => {
  const match = buildFilteredMatch(filters);

  if (!filters.type || filters.type === "all") {
    match.equipmentType = "dumper";
  }

  return ShiftEquipmentRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          materialId: "$materialId",
          materialCategory: "$materialCategory",
        },
        tonnage: { $sum: "$materialTonnage" },
        volumeBcm: { $sum: "$volumeBcm" },
        trips: { $sum: "$trips" },
      },
    },
    {
      $project: {
        _id: 0,
        materialId: "$_id.materialId",
        materialCategory: "$_id.materialCategory",
        tonnage: { $round: ["$tonnage", 2] },
        volumeBcm: { $round: ["$volumeBcm", 2] },
        trips: "$trips",
      },
    },
    { $sort: { tonnage: -1 } },
  ]);
};

