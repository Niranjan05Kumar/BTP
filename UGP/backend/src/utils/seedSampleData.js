import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Equipment from "../models/Equipment.js";
import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import ProductionTarget from "../models/ProductionTarget.js";

dotenv.config();

const SHIFTS = ["A", "B", "C"];
const DOWNTIME_REASONS = [
  "Maintenance",
  "Breakdown",
  "Operator Change",
  "Fuel Delay",
  "Weather",
  "No Downtime",
];

const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const randomBetween = (min, max, seed) => min + (max - min) * seededRandom(seed);

const equipmentFleet = [
  { equipmentId: "D1", type: "dumper", capacityTon: 60 },
  { equipmentId: "D2", type: "dumper", capacityTon: 60 },
  { equipmentId: "D3", type: "dumper", capacityTon: 50 },
  { equipmentId: "D4", type: "dumper", capacityTon: 50 },
  { equipmentId: "D5", type: "dumper", capacityTon: 45 },
  { equipmentId: "D6", type: "dumper", capacityTon: 45 },
  { equipmentId: "S1", type: "shovel", capacityTon: 18 },
  { equipmentId: "S2", type: "shovel", capacityTon: 20 },
  { equipmentId: "S3", type: "shovel", capacityTon: 22 },
];

const buildDayData = (dayIndex, date, startSeed) => {
  const records = [];

  for (let shiftIndex = 0; shiftIndex < SHIFTS.length; shiftIndex += 1) {
    const shiftCode = SHIFTS[shiftIndex];

    equipmentFleet.forEach((equipment, equipmentIndex) => {
      const seed = startSeed + dayIndex * 200 + shiftIndex * 40 + equipmentIndex;

      const utilizationPercent = randomBetween(0.6, 0.85, seed);
      const operatingHours = Number((8 * utilizationPercent).toFixed(2));
      const downtimeHours = Number((8 - operatingHours).toFixed(2));

      const reasonIndex = Math.floor(randomBetween(0, DOWNTIME_REASONS.length - 0.1, seed + 1));
      const downtimeReason = downtimeHours < 0.8 ? "No Downtime" : DOWNTIME_REASONS[reasonIndex];

      const tripsMultiplier = equipment.type === "dumper" ? 7.5 : 3.5;
      const trips = Math.max(1, Math.round((operatingHours / 8) * tripsMultiplier + randomBetween(0, 2, seed + 2)));
      const materialTonnage = Number((trips * equipment.capacityTon * randomBetween(0.88, 1.1, seed + 3)).toFixed(2));

      const fuelRate = equipment.type === "dumper" ? 20 : 16;
      const fuelLiters = Number((operatingHours * fuelRate * randomBetween(0.95, 1.1, seed + 4)).toFixed(2));
      const operatingCost = Number((fuelLiters * 1.45 + operatingHours * 18).toFixed(2));

      records.push({
        date,
        shiftCode,
        equipmentId: equipment.equipmentId,
        equipmentType: equipment.type,
        materialTonnage,
        trips,
        operatingHours,
        downtimeHours,
        downtimeReason,
        fuelLiters,
        operatingCost,
      });
    });
  }

  const dayProduction = records.reduce((sum, entry) => sum + entry.materialTonnage, 0);
  const targetTonnage = Number((dayProduction * randomBetween(0.96, 1.06, startSeed + dayIndex * 15)).toFixed(2));

  return {
    records,
    target: {
      date,
      targetTonnage,
    },
  };
};

const run = async () => {
  const shouldDrop = process.argv.includes("--drop");
  const totalDays = Number(process.env.SEED_DAYS || 21);
  const startSeed = Number(process.env.SEED_BASE || 1337);

  await connectDB();

  if (shouldDrop) {
    await Promise.all([
      Equipment.deleteMany({}),
      ShiftEquipmentRecord.deleteMany({}),
      ProductionTarget.deleteMany({}),
    ]);
  }

  await Equipment.deleteMany({});
  await Equipment.insertMany(equipmentFleet);

  await ShiftEquipmentRecord.deleteMany({});
  await ProductionTarget.deleteMany({});

  const allRecords = [];
  const allTargets = [];

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (totalDays - 1 - dayIndex));

    const { records, target } = buildDayData(dayIndex, date, startSeed);
    allRecords.push(...records);
    allTargets.push(target);
  }

  await ShiftEquipmentRecord.insertMany(allRecords);
  await ProductionTarget.insertMany(allTargets);

  console.log(`Seed complete: ${equipmentFleet.length} equipment, ${allRecords.length} records, ${allTargets.length} targets.`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
