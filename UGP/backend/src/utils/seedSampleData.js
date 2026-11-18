import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Mine from "../models/Mine.js";
import Material from "../models/Material.js";
import Equipment from "../models/Equipment.js";
import DataSource from "../models/DataSource.js";
import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import ProductionTarget from "../models/ProductionTarget.js";
import HaulageCycleRecord from "../models/HaulageCycleRecord.js";
import DowntimeEvent from "../models/DowntimeEvent.js";
import MineProductionRecord from "../models/MineProductionRecord.js";
import { defaultMine, defaultMaterials, equipmentFleet } from "../data/masterCatalog.js";
import { publicDataSources, publicMineBenchmarks } from "../data/publicBenchmarks.js";

dotenv.config();

/**
 * Deterministic PRNG using sine hash
 */
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const randomBetween = (min, max, seed) => min + (max - min) * seededRandom(seed);

const SHIFTS = ["A", "B", "C"];

const UNPLANNED_FAILURES = [
  { subSystem: "Hydraulics", reason: "Hydraulic Cylinder Seal Failure", repairRatio: 0.85 },
  { subSystem: "Hydraulics", reason: "High-Pressure Hose Burst", repairRatio: 0.9 },
  { subSystem: "Engine", reason: "Engine Overheating - Radiator Choked", repairRatio: 0.8 },
  { subSystem: "Transmission", reason: "Torque Converter Slip", repairRatio: 0.95 },
  { subSystem: "Electrical", reason: "Alternator / Starter Motor Trip", repairRatio: 0.75 },
  { subSystem: "Tires & Tracks", reason: "Rock Cut Haul Tire Puncture", repairRatio: 0.8 },
  { subSystem: "Structural", reason: "Bucket Tooth Adapter Broken", repairRatio: 0.7 },
];

const PLANNED_MAINTENANCE = [
  { subSystem: "General", reason: "Scheduled 250-Hour PM Service", repairRatio: 0 },
  { subSystem: "General", reason: "Pre-Shift Lubrication & Grease Service", repairRatio: 0 },
  { subSystem: "Tires & Tracks", reason: "Track Tensioning and Inspection", repairRatio: 0 },
];

const OPERATIONAL_DELAYS = [
  { subSystem: "Operational", reason: "Shift Changeover & Safety Briefing" },
  { subSystem: "Operational", reason: "Blasting Bench Clearance Delay" },
  { subSystem: "Operational", reason: "Refueling Bay Waiting Queue" },
  { subSystem: "Weather", reason: "Heavy Dust / Fog Visibility Delay" },
  { subSystem: "Operational", reason: "Haul Road Grading & Maintenance Spillage" },
];

/**
 * Build 1 Day of Realistic Surface Mining Operations Data
 */
const buildDayOperationalData = (dayIndex, date, startSeed, materialsMap) => {
  const shiftRecords = [];
  const cycleRecords = [];
  const downtimeEvents = [];

  // Weather or pit condition anomaly every ~9 days (e.g. heavy dust or localized rain)
  const isAdverseWeatherDay = seededRandom(startSeed + dayIndex * 99) > 0.88;

  for (let shiftIdx = 0; shiftIdx < SHIFTS.length; shiftIdx += 1) {
    const shiftCode = SHIFTS[shiftIdx];

    // Truck assignments:
    // DT-101, DT-102, DT-103 -> SH-01 (Coal Bench)
    // DT-104, DT-105 -> SH-02 (OB Sandstone Bench)
    // DT-106, DT-107 -> SH-03 (OB Shale Bench)
    const truckAssignments = {
      "DT-101": { shovelId: "SH-01", materialId: "COAL_ROM" },
      "DT-102": { shovelId: "SH-01", materialId: "COAL_ROM" },
      "DT-103": { shovelId: "SH-01", materialId: "COAL_ROM" },
      "DT-104": { shovelId: "SH-02", materialId: "OB_SANDSTONE" },
      "DT-105": { shovelId: "SH-02", materialId: "OB_SANDSTONE" },
      "DT-106": { shovelId: "SH-03", materialId: "OB_SHALE" },
      "DT-107": { shovelId: "SH-03", materialId: "OB_SHALE" },
    };

    equipmentFleet.forEach((equipment, equipIdx) => {
      const seed = startSeed + dayIndex * 500 + shiftIdx * 60 + equipIdx * 3;

      let primaryMaterialId = "COAL_ROM";
      let materialCategory = "Mineral";

      if (equipment.equipmentId === "SH-01" || equipment.equipmentId === "WL-01") {
        primaryMaterialId = "COAL_ROM";
        materialCategory = "Mineral";
      } else if (equipment.equipmentId === "SH-02") {
        primaryMaterialId = "OB_SANDSTONE";
        materialCategory = "Overburden";
      } else if (equipment.equipmentId === "SH-03") {
        primaryMaterialId = "OB_SHALE";
        materialCategory = "Overburden";
      } else if (equipment.type === "dumper") {
        primaryMaterialId = truckAssignments[equipment.equipmentId].materialId;
        materialCategory = primaryMaterialId === "COAL_ROM" ? "Mineral" : "Overburden";
      } else {
        primaryMaterialId = "OB_SANDSTONE";
        materialCategory = "Support";
      }

      const material = materialsMap[primaryMaterialId] || materialsMap["COAL_ROM"];

      // Determine Time Allocation: To + Ti + Tm = 8.0 hrs
      const maintenanceProb = seededRandom(seed + 1);
      let maintenanceHours = 0;
      let primaryReason = "None";
      let eventCategory = "Operational Delay";
      let subSystem = "General";
      let isFailure = false;
      let repairHours = 0;

      if (maintenanceProb > 0.88) {
        // Unplanned Breakdown Event (qualifying failure)
        const failureType = UNPLANNED_FAILURES[Math.floor(randomBetween(0, UNPLANNED_FAILURES.length - 0.01, seed + 2))];
        maintenanceHours = Number(randomBetween(1.2, 3.8, seed + 3).toFixed(2));
        primaryReason = failureType.reason;
        eventCategory = "Unplanned Breakdown";
        subSystem = failureType.subSystem;
        isFailure = true;
        repairHours = Number((maintenanceHours * failureType.repairRatio).toFixed(2));
      } else if (maintenanceProb > 0.76) {
        // Planned Maintenance Event
        const pmType = PLANNED_MAINTENANCE[Math.floor(randomBetween(0, PLANNED_MAINTENANCE.length - 0.01, seed + 4))];
        maintenanceHours = Number(randomBetween(0.8, 2.0, seed + 5).toFixed(2));
        primaryReason = pmType.reason;
        eventCategory = "Planned Maintenance";
        subSystem = pmType.subSystem;
        isFailure = false;
        repairHours = 0;
      }

      // Idle / Operational Delays (shift change, lunch, blasting, queue)
      const baseIdle = isAdverseWeatherDay ? randomBetween(1.5, 2.5, seed + 6) : randomBetween(0.8, 1.6, seed + 6);
      const remainingForWork = Math.max(0, 8.0 - maintenanceHours);
      const idleHours = Number(Math.min(remainingForWork, baseIdle).toFixed(2));
      const operatingHours = Number(Math.max(0, 8.0 - maintenanceHours - idleHours).toFixed(2));

      // Reconcile to exactly 8.0 hours
      const reconciledIdle = Number((8.0 - operatingHours - maintenanceHours).toFixed(2));

      // Log Downtime Event if maintenance occurred
      if (maintenanceHours > 0) {
        downtimeEvents.push({
          date,
          shiftCode,
          equipmentId: equipment.equipmentId,
          equipmentType: equipment.type,
          category: eventCategory,
          subSystem,
          reason: primaryReason,
          downtimeHours: maintenanceHours,
          repairHours,
          isFailure,
          dataSource: "synthetic_simulation",
        });
      }

      // Production & Cycles
      let materialTonnage = 0;
      let volumeBcm = 0;
      let trips = 0;

      if (equipment.type === "dumper") {
        const assignedShovel = truckAssignments[equipment.equipmentId].shovelId;
        // Average cycle time in minutes (18 - 28 min)
        const avgCycleMinutes = randomBetween(20, 26, seed + 7);
        trips = operatingHours > 0.5 ? Math.max(1, Math.round((operatingHours * 60) / avgCycleMinutes)) : 0;

        let dumperShiftTonnage = 0;

        for (let t = 0; t < trips; t += 1) {
          const tripSeed = seed + t * 7;
          const rated = equipment.capacityTon;
          const payload = Number((rated * randomBetween(0.92, 1.04, tripSeed)).toFixed(2));

          const queueWait = Number(randomBetween(1.5, 4.8, tripSeed + 1).toFixed(2));
          const spotLoad = Number(randomBetween(2.8, 4.2, tripSeed + 2).toFixed(2));
          const loadedTravel = Number(randomBetween(6.5, 9.5, tripSeed + 3).toFixed(2));
          const spotDump = Number(randomBetween(1.2, 2.0, tripSeed + 4).toFixed(2));
          const emptyReturn = Number(randomBetween(5.5, 8.0, tripSeed + 5).toFixed(2));
          const totalCycle = Number((queueWait + spotLoad + loadedTravel + spotDump + emptyReturn).toFixed(2));

          dumperShiftTonnage += payload;

          cycleRecords.push({
            date,
            shiftCode,
            dumperId: equipment.equipmentId,
            shovelId: assignedShovel,
            materialId: primaryMaterialId,
            payloadTonnage: payload,
            queueWaitMinutes: queueWait,
            spotLoadMinutes: spotLoad,
            loadedTravelMinutes: loadedTravel,
            spotDumpMinutes: spotDump,
            emptyReturnMinutes: emptyReturn,
            totalCycleMinutes: totalCycle,
            dataSource: "synthetic_simulation",
          });
        }

        materialTonnage = Number(dumperShiftTonnage.toFixed(2));
        volumeBcm = Number((materialTonnage / material.densityInSitu).toFixed(2));
      } else if (equipment.type === "shovel" || equipment.type === "wheel_loader") {
        // Face excavation loading: tracked separately from dumper haulage delivery
        const hourlyRate = equipment.bucketCapacityM3 * 65 * randomBetween(0.88, 1.05, seed + 8);
        materialTonnage = Number((operatingHours * hourlyRate).toFixed(2));
        volumeBcm = Number((materialTonnage / material.densityInSitu).toFixed(2));
        trips = Math.round(materialTonnage / 55);
      } else if (equipment.type === "drill") {
        // Drill tracks meters drilled (represented under trips)
        trips = Math.round(operatingHours * randomBetween(16, 24, seed + 9)); // drill meters
        materialTonnage = 0;
        volumeBcm = 0;
      } else {
        // Dozer, Grader, Water Tanker: support machinery
        trips = Math.round(operatingHours * 3);
        materialTonnage = 0;
        volumeBcm = 0;
      }

      // Fuel burn model based on engine power and operating hours
      // Typical diesel burn: 0.035 to 0.045 liters / HP / operating hour
      const specificFuelRate = (equipment.ratedPowerHp || 400) * 0.042;
      const fuelLiters = Number(
        (operatingHours * specificFuelRate * randomBetween(0.92, 1.08, seed + 10)).toFixed(2)
      );

      // Cost model: Diesel at ₹92/L + Maintenance Spares + Operator Wage
      const dieselCost = fuelLiters * 92;
      const maintenanceCost = operatingHours * 950 + maintenanceHours * 1600;
      const laborCost = 8.0 * 350; // ₹350/hr technician/operator
      const operatingCost = Number((dieselCost + maintenanceCost + laborCost).toFixed(2));

      shiftRecords.push({
        date,
        shiftCode,
        equipmentId: equipment.equipmentId,
        equipmentType: equipment.type,
        materialId: primaryMaterialId,
        materialCategory,
        materialTonnage,
        volumeBcm,
        trips,
        operatingHours,
        idleHours: reconciledIdle,
        maintenanceHours,
        downtimeHours: maintenanceHours,
        downtimeReason: primaryReason,
        primaryDowntimeReason: primaryReason,
        fuelLiters,
        operatingCost,
        dataSource: "synthetic_simulation",
      });
    });
  }

  // Generate shift-level targets and 24-hr daily targets
  // Net mine production is derived from dumper delivered tonnage
  const coalTonnage = shiftRecords
    .filter((r) => r.equipmentType === "dumper" && r.materialCategory === "Mineral")
    .reduce((s, r) => s + r.materialTonnage, 0);

  const obTonnage = shiftRecords
    .filter((r) => r.equipmentType === "dumper" && r.materialCategory === "Overburden")
    .reduce((s, r) => s + r.materialTonnage, 0);

  const totalDumperTonnage = coalTonnage + obTonnage;

  const targets = [];

  // Daily aggregate target
  const dailyTargetVariance = randomBetween(0.95, 1.05, startSeed + dayIndex * 21);
  targets.push({
    date,
    shiftCode: "ALL",
    materialCategory: "Total",
    targetTonnage: Number((totalDumperTonnage * dailyTargetVariance).toFixed(2)),
  });

  // Shift-specific targets for Mineral and Overburden
  for (let sIdx = 0; sIdx < SHIFTS.length; sIdx += 1) {
    const sCode = SHIFTS[sIdx];
    const shiftDumperTonnage = shiftRecords
      .filter((r) => r.shiftCode === sCode && r.equipmentType === "dumper")
      .reduce((s, r) => s + r.materialTonnage, 0);

    const shiftTargetVariance = randomBetween(0.96, 1.04, startSeed + dayIndex * 31 + sIdx);
    targets.push({
      date,
      shiftCode: sCode,
      materialCategory: "Total",
      targetTonnage: Number((shiftDumperTonnage * shiftTargetVariance).toFixed(2)),
    });
  }

  return {
    shiftRecords,
    cycleRecords,
    downtimeEvents,
    targets,
  };
};

/**
 * Main Deterministic Seed Runner
 */
export const runSeed = async (options = {}) => {
  const totalDays = Number(options.totalDays || process.env.SEED_DAYS || 30);
  const startSeed = Number(options.startSeed || process.env.SEED_BASE || 1337);
  const dropExisting = options.dropExisting !== undefined ? options.dropExisting : true;

  console.log(`Starting Database Seed: ${totalDays} days, seed base ${startSeed}...`);

  await connectDB();

  if (dropExisting) {
    console.log("Dropping existing operational and master collections...");
    await Promise.all([
      Mine.deleteMany({}),
      Material.deleteMany({}),
      Equipment.deleteMany({}),
      DataSource.deleteMany({}),
      ShiftEquipmentRecord.deleteMany({}),
      ProductionTarget.deleteMany({}),
      HaulageCycleRecord.deleteMany({}),
      DowntimeEvent.deleteMany({}),
      MineProductionRecord.deleteMany({}),
    ]);
  }

  // 1. Seed Master Data
  console.log("Inserting Master Data (Mines, Materials, 16-Unit Equipment Fleet, DataSources)...");
  await Mine.create(defaultMine);
  await Material.insertMany(defaultMaterials);
  await Equipment.insertMany(equipmentFleet);
  await DataSource.insertMany(publicDataSources);

  // 2. Seed Public Reference Benchmark Data
  console.log("Inserting Public Mining Reference Benchmarks (CIL, IBM, DGMS)...");
  await MineProductionRecord.insertMany(publicMineBenchmarks);

  const materialsMap = {};
  defaultMaterials.forEach((m) => {
    materialsMap[m.materialId] = m;
  });

  // 3. Generate 30 Days of Shift Operations Data
  console.log(`Generating ${totalDays} days of deterministic operational records...`);
  const allShiftRecords = [];
  const allCycleRecords = [];
  const allDowntimeEvents = [];
  const allTargets = [];

  for (let d = 0; d < totalDays; d += 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (totalDays - 1 - d));

    const { shiftRecords, cycleRecords, downtimeEvents, targets } = buildDayOperationalData(
      d,
      date,
      startSeed,
      materialsMap
    );

    allShiftRecords.push(...shiftRecords);
    allCycleRecords.push(...cycleRecords);
    allDowntimeEvents.push(...downtimeEvents);
    allTargets.push(...targets);
  }

  console.log(`Inserting ${allShiftRecords.length} shift-equipment fact records...`);
  await ShiftEquipmentRecord.insertMany(allShiftRecords);

  console.log(`Inserting ${allCycleRecords.length} haulage cycle trip records...`);
  await HaulageCycleRecord.insertMany(allCycleRecords);

  console.log(`Inserting ${allDowntimeEvents.length} downtime & failure events...`);
  await DowntimeEvent.insertMany(allDowntimeEvents);

  console.log(`Inserting ${allTargets.length} shift and daily production targets...`);
  await ProductionTarget.insertMany(allTargets);

  const summary = {
    mines: 1,
    materials: defaultMaterials.length,
    equipment: equipmentFleet.length,
    dataSources: publicDataSources.length,
    publicBenchmarks: publicMineBenchmarks.length,
    shiftRecords: allShiftRecords.length,
    haulageCycles: allCycleRecords.length,
    downtimeEvents: allDowntimeEvents.length,
    productionTargets: allTargets.length,
    days: totalDays,
  };

  console.log("Seed successfully completed:", summary);
  return summary;
};

// Auto-run if executed directly via CLI
if (process.argv[1]?.endsWith("seedSampleData.js")) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed execution failed:", err);
      process.exit(1);
    });
}
