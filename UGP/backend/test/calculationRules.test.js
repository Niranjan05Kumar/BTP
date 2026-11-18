import test from "node:test";
import assert from "node:assert/strict";

/**
 * Mining Engineering Calculation Formulas Unit Test Suite
 */

test("Mechanical Availability (MA), Operating Utilization (OU), Use of Availability (UA)", async (t) => {
  await t.test("Standard normal operating shift (6.0h op, 1.2h idle, 0.8h maint)", () => {
    const scheduled = 8.0;
    const maintenance = 0.8;
    const idle = 1.2;
    const operating = 6.0;

    assert.equal(operating + idle + maintenance, scheduled);

    // MA = (Scheduled - Maintenance) / Scheduled * 100
    const ma = ((scheduled - maintenance) / scheduled) * 100;
    assert.equal(Number(ma.toFixed(2)), 90.0);

    // OU = Operating / Scheduled * 100
    const ou = (operating / scheduled) * 100;
    assert.equal(Number(ou.toFixed(2)), 75.0);

    // UA = Operating / (Scheduled - Maintenance) * 100
    const ua = (operating / (scheduled - maintenance)) * 100;
    assert.equal(Number(ua.toFixed(2)), 83.33);

    // Mathematical identity: OU = (MA / 100) * UA
    const computedOu = (ma / 100) * ua;
    assert.ok(Math.abs(computedOu - ou) < 0.01);
  });

  await t.test("Edge case: Machine broken down for entire shift (0h op, 0h idle, 8.0h maint)", () => {
    const scheduled = 8.0;
    const maintenance = 8.0;
    const operating = 0;
    const available = scheduled - maintenance; // 0

    const ma = ((scheduled - maintenance) / scheduled) * 100;
    assert.equal(ma, 0);

    const ou = (operating / scheduled) * 100;
    assert.equal(ou, 0);

    // UA safe guard when available == 0
    const ua = available > 0 ? (operating / available) * 100 : 0;
    assert.equal(ua, 0);
  });

  await t.test("Edge case: Zero scheduled hours (prevent division by zero)", () => {
    const scheduled = 0;
    const operating = 0;
    const maintenance = 0;

    const ma = scheduled > 0 ? ((scheduled - maintenance) / scheduled) * 100 : 0;
    const ou = scheduled > 0 ? (operating / scheduled) * 100 : 0;

    assert.equal(ma, 0);
    assert.equal(ou, 0);
  });
});

test("Shovel-Dumper Match Factor (MF) and Pass Calculation", async (t) => {
  await t.test("Balanced fleet (MF = 1.0)", () => {
    const Nd = 6; // 6 dumpers
    const Ns = 1; // 1 shovel
    const tl = 3.5; // 3.5 min loading time
    const Tc = 21.0; // 21 min cycle time

    const mf = (Nd * tl) / (Ns * Tc);
    assert.equal(mf, 1.0);
  });

  await t.test("Under-trucked fleet (shovel starved, MF < 0.85)", () => {
    const Nd = 4;
    const Ns = 1;
    const tl = 3.2;
    const Tc = 24.0;

    const mf = (Nd * tl) / (Ns * Tc);
    assert.ok(mf < 0.85);
    assert.equal(Number(mf.toFixed(3)), 0.533);
  });

  await t.test("Over-trucked fleet (trucks queuing, MF > 1.05)", () => {
    const Nd = 8;
    const Ns = 1;
    const tl = 3.5;
    const Tc = 20.0;

    const mf = (Nd * tl) / (Ns * Tc);
    assert.ok(mf > 1.05);
    assert.equal(Number(mf.toFixed(2)), 1.4);
  });

  await t.test("Loading pass count estimation", () => {
    const dumperPayloadCapacityTon = 60.0;
    const shovelBucketM3 = 10.0;
    const rockDensityInSitu = 2.4; // t/m³
    const fillFactor = 0.95;
    const swellFactor = 1.3;

    // Bucket payload = Vb * density * FF / SF
    const bucketPayloadTon = (shovelBucketM3 * rockDensityInSitu * fillFactor) / swellFactor;
    assert.equal(Number(bucketPayloadTon.toFixed(2)), 17.54);

    const passes = Math.ceil(dumperPayloadCapacityTon / bucketPayloadTon);
    assert.equal(passes, 4);
  });
});

test("Stripping Ratios and Volumetric/Gravimetric Unit Conversions", async (t) => {
  await t.test("Volumetric and Gravimetric ratio calculations with density conversion", () => {
    const coalMassTonnes = 50000;
    const obMassTonnes = 288000;
    const obInSituDensity = 2.4; // t/m³

    // Volumetric Overburden Volume in BCM
    const obVolumeBcm = obMassTonnes / obInSituDensity;
    assert.equal(obVolumeBcm, 120000);

    // Volumetric Stripping Ratio: m³/t
    const srV = obVolumeBcm / coalMassTonnes;
    assert.equal(srV, 2.4);

    // Gravimetric Stripping Ratio: t/t
    const srM = obMassTonnes / coalMassTonnes;
    assert.equal(srM, 5.76);

    // Mathematical equivalence: SR_m = SR_v * rho_OB
    assert.equal(Number((srV * obInSituDensity).toFixed(2)), srM);
  });

  await t.test("Zero coal production guard (zero division handling)", () => {
    const coalMass = 0;
    const obVolumeBcm = 5000;

    const srV = coalMass > 0 ? obVolumeBcm / coalMass : 0;
    assert.equal(srV, 0);
  });
});

test("Reliability Metrics: MTBF & MTTR with Qualifying Breakdown Isolation", async (t) => {
  await t.test("MTBF and MTTR only count unplanned breakdown events", () => {
    const operatingHours = 210.0;

    const events = [
      { category: "Unplanned Breakdown", isFailure: true, repairHours: 3.5, downtimeHours: 4.0 },
      { category: "Unplanned Breakdown", isFailure: true, repairHours: 2.5, downtimeHours: 3.0 },
      { category: "Planned Maintenance", isFailure: false, repairHours: 0, downtimeHours: 2.0 },
      { category: "Operational Delay", isFailure: false, repairHours: 0, downtimeHours: 1.5 },
    ];

    // Filter qualifying failures
    const qualifyingFailures = events.filter((e) => e.isFailure && e.category === "Unplanned Breakdown");
    assert.equal(qualifyingFailures.length, 2);

    const Nf = qualifyingFailures.length;
    const totalRepairHours = qualifyingFailures.reduce((s, e) => s + e.repairHours, 0);
    assert.equal(totalRepairHours, 6.0);

    const mtbf = operatingHours / Nf;
    assert.equal(mtbf, 105.0); // 210 / 2 = 105 hrs

    const mttr = totalRepairHours / Nf;
    assert.equal(mttr, 3.0); // 6.0 / 2 = 3.0 hrs
  });

  await t.test("Zero failures recorded (perfect reliability)", () => {
    const operatingHours = 180.0;
    const qualifyingFailures = [];

    const Nf = qualifyingFailures.length;
    const mtbf = Nf > 0 ? operatingHours / Nf : operatingHours;
    const mttr = Nf > 0 ? 0 / Nf : 0;

    assert.equal(mtbf, 180.0);
    assert.equal(mttr, 0.0);
  });
});

test("Haulage Cycle Time Non-Overlapping Phase Composition", async () => {
  const tw = 3.2; // Queue wait
  const tl = 3.8; // Spot & load
  const th = 8.5; // Loaded travel
  const td = 1.5; // Spot & dump
  const tr = 6.8; // Empty return

  const Tc = tw + tl + th + td + tr;
  assert.equal(Number(Tc.toFixed(2)), 23.8);

  const queueContribution = (tw / Tc) * 100;
  assert.equal(Number(queueContribution.toFixed(2)), 13.45);

  const payloadTonnes = 55.0;
  // Productivity = Payload * 60 / Tc
  const hourlyProductivity = (payloadTonnes * 60) / Tc;
  assert.equal(Number(hourlyProductivity.toFixed(2)), 138.66);
});

test("Fuel Intensity and Specific Operating Cost", async () => {
  const fuelLiters = 4500;
  const operatingHours = 150;
  const productionTonnage = 12000;
  const totalCost = 4500 * 92 + 150 * 950 + 150 * 350; // Diesel + Maint + Labor

  const litersPerHour = fuelLiters / operatingHours;
  assert.equal(litersPerHour, 30.0);

  const litersPerTonne = fuelLiters / productionTonnage;
  assert.equal(litersPerTonne, 0.375);

  const costPerTonne = totalCost / productionTonnage;
  assert.equal(Number(costPerTonne.toFixed(2)), 50.75);

  // Safe zero-production handling
  const safeCost = 0 > 0 ? totalCost / 0 : 0;
  assert.equal(safeCost, 0);
});

test("Production Double-Counting Prevention and Shift-Target Scaling", async () => {
  // Scenario: Shovel SH-01 digs 1800 tonnes into Dumpers DT-101 and DT-102.
  // DT-101 hauls 900 tonnes, DT-102 hauls 900 tonnes.
  const records = [
    { equipmentType: "shovel", materialTonnage: 1800, equipmentId: "SH-01" },
    { equipmentType: "dumper", materialTonnage: 900, equipmentId: "DT-101" },
    { equipmentType: "dumper", materialTonnage: 900, equipmentId: "DT-102" },
  ];

  // Naive summation (BUGGY):
  const naiveTotal = records.reduce((s, r) => s + r.materialTonnage, 0);
  assert.equal(naiveTotal, 3600); // 1800 + 900 + 900 = 3600 (DOUBLE COUNTED!)

  // Correct canonical mine production (Dumper Delivery only):
  const canonicalTotal = records
    .filter((r) => r.equipmentType === "dumper")
    .reduce((s, r) => s + r.materialTonnage, 0);
  assert.equal(canonicalTotal, 1800); // Exactly matches physical mine output!

  // Shift Target Scaling: 24h daily target = 5400 tonnes.
  // Shift A delivers 1800 tonnes.
  const daily24hTarget = 5400;
  const shiftWeight = 1 / 3;
  const shiftTarget = daily24hTarget * shiftWeight; // 1800 tonnes
  const attainment = (canonicalTotal / shiftTarget) * 100;
  assert.equal(attainment, 100); // Shift A accurately met 100% of shift plan!
});

