import {
  getDailyProductionWithTarget,
  getDowntimeByReason,
  getEquipmentUtilization,
  getShiftProduction,
  getSummaryKPIs,
} from "../utils/kpiUtils.js";
import { validateDateRange, validateEquipmentType, validateShift } from "../utils/validators.js";

export const fetchSummary = async (req, res, next) => {
  try {
    const { start, end, shift = "all", type = "all" } = req.query;
    validateDateRange(start, end);
    validateEquipmentType(type);

    if (shift !== "all") {
      validateShift(shift);
    }

    const data = await getSummaryKPIs(start, end, shift, type);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchDailyProduction = async (req, res, next) => {
  try {
    const { start, end, shift = "all", type = "all" } = req.query;
    validateDateRange(start, end);
    validateEquipmentType(type);

    if (shift !== "all") {
      validateShift(shift);
    }

    const data = await getDailyProductionWithTarget(start, end, shift, type);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchShiftProduction = async (req, res, next) => {
  try {
    const { start, end, shift = "all", type = "all" } = req.query;

    validateDateRange(start, end);
    validateEquipmentType(type);

    if (shift !== "all") {
      validateShift(shift);
    }

    const data = await getShiftProduction(start, end, shift, type);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchEquipmentUtilization = async (req, res, next) => {
  try {
    const { start, end, shift = "all", type = "all" } = req.query;
    validateDateRange(start, end);
    validateEquipmentType(type);

    if (shift !== "all") {
      validateShift(shift);
    }

    const data = await getEquipmentUtilization(start, end, shift, type);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchDowntimeByReason = async (req, res, next) => {
  try {
    const { start, end, shift = "all", type = "all" } = req.query;
    validateDateRange(start, end);
    validateEquipmentType(type);

    if (shift !== "all") {
      validateShift(shift);
    }

    const data = await getDowntimeByReason(start, end, shift, type);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
