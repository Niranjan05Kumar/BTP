import test from "node:test";
import assert from "node:assert/strict";
import {
  validateDateRange,
  validateShift,
  validateEquipmentType,
  validateMaterialCategory,
  parseFilterQuery,
} from "../src/utils/validators.js";

/**
 * Query Validation & Parameter Filtering Unit Tests
 */

test("Date Range Validation", () => {
  // Valid ISO date range
  assert.doesNotThrow(() => validateDateRange("2026-10-01", "2026-10-30"));
  // Same day range
  assert.doesNotThrow(() => validateDateRange("2026-10-15", "2026-10-15"));

  // Missing start or end
  assert.throws(() => validateDateRange(null, "2026-10-30"), /Both start and end/);
  assert.throws(() => validateDateRange("2026-10-01", null), /Both start and end/);

  // Inverted range (start after end)
  assert.throws(() => validateDateRange("2026-10-31", "2026-10-01"), /Start date cannot be after/);

  // Invalid date format
  assert.throws(() => validateDateRange("invalid-date", "2026-10-30"), /Invalid date format/);
});

test("Shift Code Validation", () => {
  assert.doesNotThrow(() => validateShift("A"));
  assert.doesNotThrow(() => validateShift("B"));
  assert.doesNotThrow(() => validateShift("C"));

  assert.throws(() => validateShift("D"), /Invalid shift code/);
  assert.throws(() => validateShift("1"), /Invalid shift code/);
  assert.throws(() => validateShift(""), /Invalid shift code/);
});

test("Equipment Type Validation", () => {
  const allowed = [
    "all",
    "dumper",
    "shovel",
    "wheel_loader",
    "dozer",
    "drill",
    "motor_grader",
    "water_tanker",
  ];

  allowed.forEach((type) => {
    assert.doesNotThrow(() => validateEquipmentType(type));
  });

  assert.throws(() => validateEquipmentType("crane"), /Invalid equipment type/);
  assert.throws(() => validateEquipmentType("aeroplane"), /Invalid equipment type/);
});

test("Material Category Validation", () => {
  const allowed = ["all", "Ore", "Mineral", "Overburden", "Waste", "Topsoil", "Support"];

  allowed.forEach((cat) => {
    assert.doesNotThrow(() => validateMaterialCategory(cat));
  });

  assert.throws(() => validateMaterialCategory("Plastic"), /Invalid material category/);
});

test("parseFilterQuery Helper", () => {
  const query = {
    start: "2026-10-01",
    end: "2026-10-30",
    shift: "B",
    type: "shovel",
    material: "Mineral",
  };

  const parsed = parseFilterQuery(query);
  assert.equal(parsed.start, "2026-10-01");
  assert.equal(parsed.end, "2026-10-30");
  assert.equal(parsed.shift, "B");
  assert.equal(parsed.type, "shovel");
  assert.equal(parsed.material, "Mineral");
});

