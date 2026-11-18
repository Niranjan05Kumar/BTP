import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import Material from "../models/Material.js";
import { buildRangeMatch } from "./queryHelpers.js";

/**
 * Material Production & Stripping-Ratio Analysis Service
 */

export const getStrippingRatioAnalysis = async (filters) => {
  const match = {
    ...buildRangeMatch(filters.start, filters.end),
    equipmentType: "dumper", // Dumper delivery prevents double counting
  };

  if (filters.shift && filters.shift !== "all") {
    match.shiftCode = filters.shift;
  }

  const [categoryTotals, dailyBreakdown] = await Promise.all([
    ShiftEquipmentRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$materialCategory",
          tonnage: { $sum: "$materialTonnage" },
          volumeBcm: { $sum: "$volumeBcm" },
          trips: { $sum: "$trips" },
        },
      },
    ]),
    ShiftEquipmentRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            category: "$materialCategory",
          },
          tonnage: { $sum: "$materialTonnage" },
          volumeBcm: { $sum: "$volumeBcm" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          categories: {
            $push: {
              category: "$_id.category",
              tonnage: "$tonnage",
              volumeBcm: "$volumeBcm",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  let mineralTonnage = 0;
  let mineralVolumeBcm = 0;
  let obTonnage = 0;
  let obVolumeBcm = 0;

  categoryTotals.forEach((cat) => {
    if (cat._id === "Mineral" || cat._id === "Ore") {
      mineralTonnage += cat.tonnage;
      mineralVolumeBcm += cat.volumeBcm;
    } else if (cat._id === "Overburden" || cat._id === "Waste" || cat._id === "Topsoil") {
      obTonnage += cat.tonnage;
      obVolumeBcm += cat.volumeBcm;
    }
  });

  // Volumetric Stripping Ratio: SR_v = OB Volume (BCM) / Mineral Mass (tonnes) [m³/t]
  const volumetricStrippingRatio = mineralTonnage > 0 ? obVolumeBcm / mineralTonnage : 0;

  // Gravimetric Stripping Ratio: SR_m = OB Mass (tonnes) / Mineral Mass (tonnes) [t/t]
  const gravimetricStrippingRatio = mineralTonnage > 0 ? obTonnage / mineralTonnage : 0;

  const trend = dailyBreakdown.map((day) => {
    let dayMineralTon = 0;
    let dayObTon = 0;
    let dayObBcm = 0;

    day.categories.forEach((c) => {
      if (c.category === "Mineral" || c.category === "Ore") {
        dayMineralTon += c.tonnage;
      } else {
        dayObTon += c.tonnage;
        dayObBcm += c.volumeBcm;
      }
    });

    const daySrV = dayMineralTon > 0 ? dayObBcm / dayMineralTon : 0;

    return {
      date: day._id,
      mineralTonnage: Number(dayMineralTon.toFixed(2)),
      overburdenTonnage: Number(dayObTon.toFixed(2)),
      overburdenBcm: Number(dayObBcm.toFixed(2)),
      volumetricStrippingRatio: Number(daySrV.toFixed(2)),
    };
  });

  return {
    mineralTonnage: Number(mineralTonnage.toFixed(2)),
    mineralVolumeBcm: Number(mineralVolumeBcm.toFixed(2)),
    overburdenTonnage: Number(obTonnage.toFixed(2)),
    overburdenVolumeBcm: Number(obVolumeBcm.toFixed(2)),
    totalMaterialTonnage: Number((mineralTonnage + obTonnage).toFixed(2)),
    volumetricStrippingRatio: Number(volumetricStrippingRatio.toFixed(3)),
    gravimetricStrippingRatio: Number(gravimetricStrippingRatio.toFixed(3)),
    unitVolumetric: "m³/tonne (BCM OB per Tonne Mineral)",
    unitGravimetric: "tonne/tonne",
    trend,
  };
};

