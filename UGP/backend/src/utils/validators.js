const SHIFT_CODES = ["A", "B", "C"];
const EQUIPMENT_TYPES = ["all", "dumper", "shovel", "dozer", "drill"];

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
  if (!EQUIPMENT_TYPES.includes(type)) {
    const error = new Error("Invalid equipment type filter.");
    error.status = 400;
    throw error;
  }
};
