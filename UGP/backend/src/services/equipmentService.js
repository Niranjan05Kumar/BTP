import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import { buildFilteredMatch } from "./queryHelpers.js";

/**
 * Equipment Performance & Availability Service
 */

export const getEquipmentUtilization = async (filters) => {
  const match = buildFilteredMatch(filters);

  return ShiftEquipmentRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          equipmentId: "$equipmentId",
          equipmentType: "$equipmentType",
        },
        operatingHours: { $sum: "$operatingHours" },
        idleHours: { $sum: "$idleHours" },
        maintenanceHours: { $sum: "$maintenanceHours" },
        productionTonnage: { $sum: "$materialTonnage" },
        trips: { $sum: "$trips" },
        shifts: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        equipmentId: "$_id.equipmentId",
        equipmentType: "$_id.equipmentType",
        operatingHours: { $round: ["$operatingHours", 2] },
        idleHours: { $round: ["$idleHours", 2] },
        maintenanceHours: { $round: ["$maintenanceHours", 2] },
        downtimeHours: { $round: ["$maintenanceHours", 2] },
        scheduledHours: { $multiply: ["$shifts", 8] },
        productionTonnage: { $round: ["$productionTonnage", 2] },
        trips: "$trips",
        shifts: "$shifts",
        // Mechanical Availability = (Scheduled - Maintenance) / Scheduled * 100
        mechanicalAvailability: {
          $round: [
            {
              $multiply: [
                {
                  $cond: [
                    { $eq: [{ $multiply: ["$shifts", 8] }, 0] },
                    0,
                    {
                      $divide: [
                        { $subtract: [{ $multiply: ["$shifts", 8] }, "$maintenanceHours"] },
                        { $multiply: ["$shifts", 8] },
                      ],
                    },
                  ],
                },
                100,
              ],
            },
            2,
          ],
        },
        // Operating Utilization = Operating Hours / Scheduled Hours * 100
        utilization: {
          $round: [
            {
              $multiply: [
                {
                  $cond: [
                    { $eq: [{ $multiply: ["$shifts", 8] }, 0] },
                    0,
                    { $divide: ["$operatingHours", { $multiply: ["$shifts", 8] }] },
                  ],
                },
                100,
              ],
            },
            2,
          ],
        },
        // Use of Availability = Operating Hours / (Scheduled - Maintenance) * 100
        useOfAvailability: {
          $round: [
            {
              $multiply: [
                {
                  $cond: [
                    { $lte: [{ $subtract: [{ $multiply: ["$shifts", 8] }, "$maintenanceHours"] }, 0] },
                    0,
                    {
                      $divide: [
                        "$operatingHours",
                        { $subtract: [{ $multiply: ["$shifts", 8] }, "$maintenanceHours"] },
                      ],
                    },
                  ],
                },
                100,
              ],
            },
            2,
          ],
        },
        // Hourly Productivity = Tonnage / Operating Hours
        productivityTonPerHour: {
          $round: [
            {
              $cond: [
                { $lte: ["$operatingHours", 0] },
                0,
                { $divide: ["$productionTonnage", "$operatingHours"] },
              ],
            },
            2,
          ],
        },
      },
    },
    { $sort: { utilization: -1, equipmentId: 1 } },
  ]);
};

export const getEquipmentSummary = async (filters) => {
  const match = buildFilteredMatch(filters);

  const [totals] = await ShiftEquipmentRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOperating: { $sum: "$operatingHours" },
        totalIdle: { $sum: "$idleHours" },
        totalMaintenance: { $sum: "$maintenanceHours" },
        totalScheduled: { $sum: 8 },
        totalShifts: { $sum: 1 },
      },
    },
  ]);

  if (!totals) {
    return {
      scheduledHours: 0,
      operatingHours: 0,
      idleHours: 0,
      maintenanceHours: 0,
      averageAvailability: 0,
      averageUtilization: 0,
      averageUseOfAvailability: 0,
    };
  }

  const scheduled = totals.totalScheduled || 0;
  const operating = totals.totalOperating || 0;
  const idle = totals.totalIdle || 0;
  const maintenance = totals.totalMaintenance || 0;
  const available = Math.max(0, scheduled - maintenance);

  const availability = scheduled > 0 ? (available / scheduled) * 100 : 0;
  const utilization = scheduled > 0 ? (operating / scheduled) * 100 : 0;
  const useOfAvailability = available > 0 ? (operating / available) * 100 : 0;

  return {
    scheduledHours: Number(scheduled.toFixed(2)),
    operatingHours: Number(operating.toFixed(2)),
    idleHours: Number(idle.toFixed(2)),
    maintenanceHours: Number(maintenance.toFixed(2)),
    averageAvailability: Number(availability.toFixed(2)),
    averageUtilization: Number(utilization.toFixed(2)),
    averageUseOfAvailability: Number(useOfAvailability.toFixed(2)),
  };
};

