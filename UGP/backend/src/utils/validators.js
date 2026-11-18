const SHIFT_CODES = ["A", "B", "C"];
const EQUIPMENT_TYPES = [
  "all",
  "dumper",
  "shovel",
  "wheel_loader",
  "dozer",
  "drill",
  "motor_grader",
  "water_tanker",
];

const MATERIAL_CATEGORIES = ["all", "Ore", "Mineral", "Overburden", "Waste", "Topsoil", "Support"];

export const validateDateRange = (start, end) => {
  if (!start || !end) {
    const error = new Error("Both start and end query parameters are required.");
    error.status = 400;
    throw error;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    const error = new Error("Invalid date format. Use YYYY-MM-DD.");
    error.status = 400;
    throw error;
  }

  if (startDate > endDate) {
    const error = new Error("Start date cannot be after end date.");
    error.status = 400;
    throw error;
  }
};

export const validateShift = (shiftCode) => {
  if (!shiftCode || !SHIFT_CODES.includes(shiftCode)) {
    const error = new Error("Invalid shift code. Allowed values: A, B, C.");
    error.status = 400;
    throw error;
  }
};

export const validateEquipmentType = (type) => {
  if (!type || !EQUIPMENT_TYPES.includes(type)) {
    const error = new Error(
      `Invalid equipment type filter. Allowed values: ${EQUIPMENT_TYPES.join(", ")}.`
    );
    error.status = 400;
    throw error;
  }
};

export const validateMaterialCategory = (category) => {
  if (category && !MATERIAL_CATEGORIES.includes(category)) {
    const error = new Error(
      `Invalid material category. Allowed values: ${MATERIAL_CATEGORIES.join(", ")}.`
    );
    error.status = 400;
    throw error;
  }
};

export const parseFilterQuery = (query) => {
  const { start, end, shift = "all", type = "all", material = "all", equipmentId = "all" } = query;
  validateDateRange(start, end);
  validateEquipmentType(type);

  if (shift !== "all") {
    validateShift(shift);
  }

  if (material !== "all") {
    validateMaterialCategory(material);
  }

  return { start, end, shift, type, material, equipmentId };
};
