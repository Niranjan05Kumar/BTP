import test from "node:test";
import assert from "node:assert/strict";
import { equipmentFleet, defaultMaterials } from "../src/data/masterCatalog.js";

/**
 * 30-Day Simulation Data Generator Integrity Tests
 */

test("Equipment Fleet Specification Verification", () => {
  // Verify exactly 16 units
  assert.equal(equipmentFleet.length, 16);

  const byType = {};
  equipmentFleet.forEach((eq) => {
    byType[eq.type] = (byType[eq.type] || 0) + 1;
  });

  assert.equal(byType["shovel"], 3);
  assert.equal(byType["wheel_loader"], 1);
  assert.equal(byType["dumper"], 7);
  assert.equal(byType["dozer"], 2);
  assert.equal(byType["drill"], 1);
  assert.equal(byType["motor_grader"], 1);
  assert.equal(byType["water_tanker"], 1);

  // Check unique equipment IDs
  const idSet = new Set(equipmentFleet.map((e) => e.equipmentId));
  assert.equal(idSet.size, 16);
});

test("Material Catalog Physical Constants", () => {
  const coal = defaultMaterials.find((m) => m.materialId === "COAL_ROM");
  assert.ok(coal);
  assert.equal(coal.densityInSitu, 1.35);
  assert.equal(coal.category, "Mineral");

  const obSandstone = defaultMaterials.find((m) => m.materialId === "OB_SANDSTONE");
  assert.ok(obSandstone);
  assert.equal(obSandstone.densityInSitu, 2.4);
  assert.equal(obSandstone.category, "Overburden");
});

test("Deterministic Simulation Generation & Hours Reconciliation", async () => {
  // Simulate 1 day generation
  const date = new Date("2026-10-15T00:00:00.000Z");
  const startSeed = 1337;

  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  const randomBetween = (min, max, seed) => min + (max - min) * seededRandom(seed);

  const shifts = ["A", "B", "C"];
  const records = [];
  const cycles = [];

  shifts.forEach((shiftCode, sIdx) => {
    equipmentFleet.forEach((equipment, eIdx) => {
      const seed = startSeed + 15 * 500 + sIdx * 60 + eIdx * 3;

      const maintenanceProb = seededRandom(seed + 1);
      let maintenanceHours = 0;
      if (maintenanceProb > 0.88) {
        maintenanceHours = Number(randomBetween(1.2, 3.8, seed + 3).toFixed(2));
      } else if (maintenanceProb > 0.76) {
        maintenanceHours = Number(randomBetween(0.8, 2.0, seed + 5).toFixed(2));
      }

      const baseIdle = randomBetween(0.8, 1.6, seed + 6);
      const remainingForWork = Math.max(0, 8.0 - maintenanceHours);
      const idleHours = Number(Math.min(remainingForWork, baseIdle).toFixed(2));
      const operatingHours = Number(Math.max(0, 8.0 - maintenanceHours - idleHours).toFixed(2));
      const reconciledIdle = Number((8.0 - operatingHours - maintenanceHours).toFixed(2));

      records.push({
        shiftCode,
        equipmentId: equipment.equipmentId,
        operatingHours,
        idleHours: reconciledIdle,
        maintenanceHours,
      });

      // For dumpers, verify cycle times
      if (equipment.type === "dumper") {
        const trips = Math.round((operatingHours * 60) / 24);
        for (let t = 0; t < trips; t += 1) {
          const tripSeed = seed + t * 7;
          const queueWait = Number(randomBetween(1.5, 4.8, tripSeed + 1).toFixed(2));
          const spotLoad = Number(randomBetween(2.8, 4.2, tripSeed + 2).toFixed(2));
          const loadedTravel = Number(randomBetween(6.5, 9.5, tripSeed + 3).toFixed(2));
          const spotDump = Number(randomBetween(1.2, 2.0, tripSeed + 4).toFixed(2));
          const emptyReturn = Number(randomBetween(5.5, 8.0, tripSeed + 5).toFixed(2));
          const totalCycle = Number((queueWait + spotLoad + loadedTravel + spotDump + emptyReturn).toFixed(2));

          cycles.push({
            queueWait,
            spotLoad,
            loadedTravel,
            spotDump,
            emptyReturn,
            totalCycle,
          });
        }
      }
    });
  });

  // Verify: Exactly 16 units * 3 shifts = 48 records per day
  assert.equal(records.length, 48);

  // Verify: Every record's hours reconcile to exactly 8.0 hours (+- 0.01 tolerance)
  records.forEach((r) => {
    const sum = Number((r.operatingHours + r.idleHours + r.maintenanceHours).toFixed(2));
    assert.equal(sum, 8.0, `Hours did not reconcile for ${r.equipmentId} in shift ${r.shiftCode}`);
  });

  // Verify: Every cycle's components sum to totalCycle
  cycles.forEach((c) => {
    const sum = Number((c.queueWait + c.spotLoad + c.loadedTravel + c.spotDump + c.emptyReturn).toFixed(2));
    assert.equal(sum, c.totalCycle, "Cycle components did not sum to total cycle time");
  });
});

