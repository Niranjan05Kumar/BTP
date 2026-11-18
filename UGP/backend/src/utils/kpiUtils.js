import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import ProductionTarget from "../models/ProductionTarget.js";
import {
  getDailyProduction as serviceDailyProduction,
  getDailyProductionWithTarget as serviceDailyProductionWithTarget,
  getShiftProduction as serviceShiftProduction,
} from "../services/productionService.js";
import { getEquipmentUtilization as serviceEquipmentUtilization } from "../services/equipmentService.js";
import { getDowntimeByReason as serviceDowntimeByReason } from "../services/downtimeService.js";
import { buildFilteredMatch, buildRangeMatch } from "../services/queryHelpers.js";

/**
 * Backward-compatible KPI Utilities
 * Delegates to domain services with canonical production boundary enforcement.
 */

export const getDailyProduction = async (start, end, shift = "all", type = "all") => {
  return serviceDailyProduction({ start, end, shift, type });
};

export const getDailyProductionWithTarget = async (start, end, shift = "all", type = "all") => {
  return serviceDailyProductionWithTarget({ start, end, shift, type });
};

export const getShiftProduction = async (start, end, shift = "all", type = "all") => {
  return serviceShiftProduction({ start, end, shift, type });
};

export const getEquipmentUtilization = async (start, end, shift = "all", type = "all") => {
  return serviceEquipmentUtilization({ start, end, shift, type });
};

export const getDowntimeByReason = async (start, end, shift = "all", type = "all") => {
  return serviceDowntimeByReason({ start, end, shift, type });
};

export const getSummaryKPIs = async (start, end, shift = "all", type = "all") => {
  const filters = { start, end, shift, type };
  const match = buildFilteredMatch(filters);

  // Canonical production point: if type is 'all', aggregate dumper delivery to prevent double counting
  const productionMatch = { ...match };
  if (!type || type === "all") {
    productionMatch.equipmentType = "dumper";
  }

  const [productionTotals, hoursTotals, dailyProduction, downtimeReasons, targetDocs] = await Promise.all([
    ShiftEquipmentRecord.aggregate([
      { $match: productionMatch },
      {
        $group: {
          _id: null,
          totalProduction: { $sum: "$materialTonnage" },
          totalVolumeBcm: { $sum: "$volumeBcm" },
          totalCost: { $sum: "$operatingCost" },
          totalFuelLiters: { $sum: "$fuelLiters" },
        },
      },
    ]),
    ShiftEquipmentRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOperatingHours: { $sum: "$operatingHours" },
          totalIdleHours: { $sum: "$idleHours" },
          totalMaintenanceHours: { $sum: "$maintenanceHours" },
          totalScheduledHours: { $sum: 8 },
        },
      },
    ]),
    serviceDailyProduction(filters),
    serviceDowntimeByReason(filters),
    ProductionTarget.aggregate([
      {
        $match: {
          ...buildRangeMatch(start, end),
          shiftCode: shift && shift !== "all" ? shift : "ALL",
        },
      },
      { $group: { _id: null, totalTarget: { $sum: "$targetTonnage" } } },
    ]),
  ]);

  const prod = productionTotals[0] || {
    totalProduction: 0,
    totalVolumeBcm: 0,
    totalCost: 0,
    totalFuelLiters: 0,
  };

  const hours = hoursTotals[0] || {
    totalOperatingHours: 0,
    totalIdleHours: 0,
    totalMaintenanceHours: 0,
    totalScheduledHours: 0,
  };

  const dailyCount = dailyProduction.length || 1;
  let totalTarget = targetDocs[0]?.totalTarget || 0;

  // If shift filter is active but only 24h targets exist, apply shift allocation factor
  if (shift && shift !== "all" && totalTarget === 0) {
    const [daily24h] = await ProductionTarget.aggregate([
      { $match: { ...buildRangeMatch(start, end), shiftCode: "ALL" } },
      { $group: { _id: null, totalTarget: { $sum: "$targetTonnage" } } },
    ]);
    totalTarget = daily24h ? daily24h.totalTarget / 3 : 0;
  }

  const averageDailyProduction = dailyCount ? prod.totalProduction / dailyCount : 0;
  const scheduledHours = hours.totalScheduledHours || 1;
  const maintenanceHours = hours.totalMaintenanceHours || 0;
  const operatingHours = hours.totalOperatingHours || 0;

  const mechanicalAvailability = scheduledHours ? ((scheduledHours - maintenanceHours) / scheduledHours) * 100 : 0;
  const averageUtilization = scheduledHours ? (operatingHours / scheduledHours) * 100 : 0;
  const downtimePercent = scheduledHours ? (maintenanceHours / scheduledHours) * 100 : 0;
  const costPerTonne = prod.totalProduction > 0 ? prod.totalCost / prod.totalProduction : 0;
  const planAttainment = totalTarget > 0 ? (prod.totalProduction / totalTarget) * 100 : 0;

  return {
    totalProduction: Number(prod.totalProduction.toFixed(2)),
    averageDailyProduction: Number(averageDailyProduction.toFixed(2)),
    averageUtilization: Number(averageUtilization.toFixed(2)),
    mechanicalAvailability: Number(mechanicalAvailability.toFixed(2)),
    totalDowntimeHours: Number(maintenanceHours.toFixed(2)),
    totalOperatingHours: Number(operatingHours.toFixed(2)),
    totalIdleHours: Number((hours.totalIdleHours || 0).toFixed(2)),
    downtimePercent: Number(downtimePercent.toFixed(2)),
    costPerTonne: Number(costPerTonne.toFixed(2)),
    planAttainment: Number(planAttainment.toFixed(2)),
    totalTarget: Number(totalTarget.toFixed(2)),
    topDowntimeReasons: downtimeReasons.slice(0, 5),
  };
};
