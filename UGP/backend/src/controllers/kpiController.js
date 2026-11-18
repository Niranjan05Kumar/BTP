import {
  getSummaryKPIs,
  getDailyProductionWithTarget,
  getShiftProduction,
  getEquipmentUtilization,
  getDowntimeByReason,
} from "../utils/kpiUtils.js";
import { getMaterialProduction } from "../services/productionService.js";
import { getEquipmentSummary } from "../services/equipmentService.js";
import {
  getDowntimeByCategory,
  getDowntimeBySubSystem,
} from "../services/downtimeService.js";
import {
  getHaulageSummary,
  getHaulageByDumper,
} from "../services/haulageService.js";
import { getFleetMatchingAnalysis } from "../services/fleetMatchingService.js";
import { getStrippingRatioAnalysis } from "../services/materialService.js";
import { getFuelCostSummary } from "../services/fuelCostService.js";
import { getReliabilityMetrics } from "../services/reliabilityService.js";
import { getOperationalInsights } from "../services/insightService.js";
import { parseFilterQuery } from "../utils/validators.js";

export const fetchSummary = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getSummaryKPIs(filters.start, filters.end, filters.shift, filters.type);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchDailyProduction = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getDailyProductionWithTarget(filters.start, filters.end, filters.shift, filters.type);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchShiftProduction = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getShiftProduction(filters.start, filters.end, filters.shift, filters.type);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchMaterialProduction = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getMaterialProduction(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchEquipmentUtilization = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getEquipmentUtilization(filters.start, filters.end, filters.shift, filters.type);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchEquipmentSummary = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getEquipmentSummary(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchDowntimeByReason = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getDowntimeByReason(filters.start, filters.end, filters.shift, filters.type);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchDowntimeByCategory = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getDowntimeByCategory(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchDowntimeBySubSystem = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getDowntimeBySubSystem(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchHaulageSummary = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getHaulageSummary(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchHaulageByDumper = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getHaulageByDumper(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchFleetMatching = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getFleetMatchingAnalysis(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchStrippingRatio = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getStrippingRatioAnalysis(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchFuelCostSummary = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getFuelCostSummary(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchReliabilityMetrics = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getReliabilityMetrics(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const fetchInsights = async (req, res, next) => {
  try {
    const filters = parseFilterQuery(req.query);
    const data = await getOperationalInsights(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
