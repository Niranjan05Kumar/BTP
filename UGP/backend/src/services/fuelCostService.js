import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import { buildFilteredMatch } from "./queryHelpers.js";

/**
 * Fuel & Cost Efficiency Service
 */

export const getFuelCostSummary = async (filters) => {
  const match = buildFilteredMatch(filters);

  const [totals, equipmentBreakdown] = await Promise.all([
    ShiftEquipmentRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalFuelLiters: { $sum: "$fuelLiters" },
          totalOperatingHours: { $sum: "$operatingHours" },
          totalCost: { $sum: "$operatingCost" },
          totalProduction: { $sum: "$materialTonnage" },
        },
      },
    ]),
    ShiftEquipmentRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            equipmentId: "$equipmentId",
            equipmentType: "$equipmentType",
          },
          fuelLiters: { $sum: "$fuelLiters" },
          operatingHours: { $sum: "$operatingHours" },
          operatingCost: { $sum: "$operatingCost" },
          productionTonnage: { $sum: "$materialTonnage" },
        },
      },
      {
        $project: {
          _id: 0,
          equipmentId: "$_id.equipmentId",
          equipmentType: "$_id.equipmentType",
          fuelLiters: { $round: ["$fuelLiters", 2] },
          operatingHours: { $round: ["$operatingHours", 2] },
          operatingCost: { $round: ["$operatingCost", 2] },
          productionTonnage: { $round: ["$productionTonnage", 2] },
          litersPerHour: {
            $round: [
              {
                $cond: [
                  { $eq: ["$operatingHours", 0] },
                  0,
                  { $divide: ["$fuelLiters", "$operatingHours"] },
                ],
              },
              2,
            ],
          },
          litersPerTonne: {
            $round: [
              {
                $cond: [
                  { $eq: ["$productionTonnage", 0] },
                  0,
                  { $divide: ["$fuelLiters", "$productionTonnage"] },
                ],
              },
              3,
            ],
          },
          costPerTonne: {
            $round: [
              {
                $cond: [
                  { $eq: ["$productionTonnage", 0] },
                  0,
                  { $divide: ["$operatingCost", "$productionTonnage"] },
                ],
              },
              2,
            ],
          },
        },
      },
      { $sort: { fuelLiters: -1 } },
    ]),
  ]);

  const summary = totals[0] || {
    totalFuelLiters: 0,
    totalOperatingHours: 0,
    totalCost: 0,
    totalProduction: 0,
  };

  const fuelTotal = summary.totalFuelLiters || 0;
  const opHoursTotal = summary.totalOperatingHours || 0;
  const costTotal = summary.totalCost || 0;
  const prodTotal = summary.totalProduction || 0;

  const litersPerHour = opHoursTotal > 0 ? fuelTotal / opHoursTotal : 0;
  const litersPerTonne = prodTotal > 0 ? fuelTotal / prodTotal : 0;
  const costPerTonne = prodTotal > 0 ? costTotal / prodTotal : 0;

  return {
    totalFuelLiters: Number(fuelTotal.toFixed(2)),
    totalOperatingHours: Number(opHoursTotal.toFixed(2)),
    totalOperatingCost: Number(costTotal.toFixed(2)),
    totalProductionTonnage: Number(prodTotal.toFixed(2)),
    averageLitersPerHour: Number(litersPerHour.toFixed(2)),
    averageLitersPerTonne: Number(litersPerTonne.toFixed(3)),
    averageCostPerTonne: Number(costPerTonne.toFixed(2)),
    equipmentBreakdown,
  };
};

