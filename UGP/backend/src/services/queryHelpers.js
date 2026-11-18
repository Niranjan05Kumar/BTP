/**
 * Standardized Date and Query Filter Helpers
 */

export const toStart = (date) => new Date(`${date}T00:00:00.000Z`);
export const toEnd = (date) => new Date(`${date}T23:59:59.999Z`);

export const buildRangeMatch = (start, end) => ({
  date: {
    $gte: toStart(start),
    $lte: toEnd(end),
  },
});

export const buildFilteredMatch = ({ start, end, shift = "all", type = "all", material = "all", equipmentId = "all" }) => {
  const match = buildRangeMatch(start, end);

  if (shift && shift !== "all") {
    match.shiftCode = shift;
  }

  if (type && type !== "all") {
    match.equipmentType = type;
  }

  if (material && material !== "all") {
    match.materialCategory = material;
  }

  if (equipmentId && equipmentId !== "all") {
    match.equipmentId = equipmentId;
  }

  return match;
};

