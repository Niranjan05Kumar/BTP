import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import ProductionTarget from "../models/ProductionTarget.js";

const toStart = (date) => new Date(`${date}T00:00:00.000Z`);
const toEnd = (date) => new Date(`${date}T23:59:59.999Z`);

const rangeMatch = (start, end) => ({
  date: {
    $gte: toStart(start),
    $lte: toEnd(end),
  },
});

const filteredMatch = (start, end, shift = "all", type = "all") => {
  const match = rangeMatch(start, end);

  if (shift !== "all") {
    match.shiftCode = shift;
  }

  if (type !== "all") {
    match.equipmentType = type;
  }

  return match;
};

export const getDailyProduction = async (start, end, shift = "all", type = "all") => {
  const match = filteredMatch(start, end, shift, type);

  return ShiftEquipmentRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
          },
        },
        actual: { $sum: "$materialTonnage" },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        actual: { $round: ["$actual", 2] },
      },
    },
    { $sort: { date: 1 } },
  ]);
};

export const getDailyProductionWithTarget = async (start, end, shift = "all", type = "all") => {
  const [actual, targets] = await Promise.all([
    getDailyProduction(start, end, shift, type),
    ProductionTarget.aggregate([
      { $match: rangeMatch(start, end) },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
          target: "$targetTonnage",
        },
      },
      { $sort: { date: 1 } },
    ]),
  ]);

  const targetMap = new Map(targets.map((item) => [item.date, item.target]));

  return actual.map((item) => ({
    date: item.date,
    actual: item.actual,
    target: Number((targetMap.get(item.date) || 0).toFixed(2)),
  }));
};

export const getShiftProduction = async (start, end, shift = "all", type = "all") => {
  const match = filteredMatch(start, end, shift, type);

  return ShiftEquipmentRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$shiftCode",
        production: { $sum: "$materialTonnage" },
      },
    },
    {
      $project: {
        _id: 0,
        shiftCode: "$_id",
        production: { $round: ["$production", 2] },
      },
    },
    { $sort: { shiftCode: 1 } },
  ]);
};

export const getEquipmentUtilization = async (start, end, shift = "all", type = "all") => {
  const match = filteredMatch(start, end, shift, type);

  return ShiftEquipmentRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          equipmentId: "$equipmentId",
          equipmentType: "$equipmentType",
        },
        operatingHours: { $sum: "$operatingHours" },
        downtimeHours: { $sum: "$downtimeHours" },
        shifts: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        equipmentId: "$_id.equipmentId",
        equipmentType: "$_id.equipmentType",
        operatingHours: { $round: ["$operatingHours", 2] },
        downtimeHours: { $round: ["$downtimeHours", 2] },
        utilization: {
          $round: [
            {
              $multiply: [
                {
                  $cond: [
                    { $eq: [{ $multiply: ["$shifts", 8] }, 0] },
                    0,
                    {
                      $divide: ["$operatingHours", { $multiply: ["$shifts", 8] }],
                    },
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
    { $sort: { utilization: -1, equipmentId: 1 } },
  ]);
};

export const getDowntimeByReason = async (start, end, shift = "all", type = "all") => {
  const match = filteredMatch(start, end, shift, type);

  return ShiftEquipmentRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$downtimeReason",
        downtimeHours: { $sum: "$downtimeHours" },
      },
    },
    {
      $project: {
        _id: 0,
        reason: "$_id",
        downtimeHours: { $round: ["$downtimeHours", 2] },
      },
    },
    { $sort: { downtimeHours: -1 } },
  ]);
};

export const getSummaryKPIs = async (start, end, shift = "all", type = "all") => {
  const match = filteredMatch(start, end, shift, type);

  const [totals, dailyProduction, downtimeReasons, targets] = await Promise.all([
    ShiftEquipmentRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalProduction: { $sum: "$materialTonnage" },
          totalOperatingHours: { $sum: "$operatingHours" },
          totalDowntimeHours: { $sum: "$downtimeHours" },
          totalCost: { $sum: "$operatingCost" },
        },
      },
    ]),
    getDailyProduction(start, end, shift, type),
    getDowntimeByReason(start, end, shift, type),
    ProductionTarget.aggregate([
      { $match: rangeMatch(start, end) },
      { $group: { _id: null, totalTarget: { $sum: "$targetTonnage" } } },
    ]),
  ]);

  const total = totals[0] || {
    totalProduction: 0,
    totalOperatingHours: 0,
    totalDowntimeHours: 0,
    totalCost: 0,
  };

  const dailyCount = dailyProduction.length;
  const totalTarget = targets[0]?.totalTarget || 0;

  const averageDailyProduction = dailyCount ? total.totalProduction / dailyCount : 0;
  const availableHours = total.totalOperatingHours + total.totalDowntimeHours;
  const averageUtilization = availableHours ? (total.totalOperatingHours / availableHours) * 100 : 0;
  const downtimePercent = availableHours ? (total.totalDowntimeHours / availableHours) * 100 : 0;
  const costPerTonne = total.totalProduction ? total.totalCost / total.totalProduction : 0;
  const planAttainment = totalTarget ? (total.totalProduction / totalTarget) * 100 : 0;

  return {
    totalProduction: Number(total.totalProduction.toFixed(2)),
    averageDailyProduction: Number(averageDailyProduction.toFixed(2)),
    averageUtilization: Number(averageUtilization.toFixed(2)),
    totalDowntimeHours: Number(total.totalDowntimeHours.toFixed(2)),
    downtimePercent: Number(downtimePercent.toFixed(2)),
    costPerTonne: Number(costPerTonne.toFixed(2)),
    planAttainment: Number(planAttainment.toFixed(2)),
    topDowntimeReasons: downtimeReasons.slice(0, 5),
  };
};
