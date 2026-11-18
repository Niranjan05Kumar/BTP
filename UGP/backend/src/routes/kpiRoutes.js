import { Router } from "express";
import {
  fetchSummary,
  fetchDailyProduction,
  fetchShiftProduction,
  fetchMaterialProduction,
  fetchEquipmentUtilization,
  fetchEquipmentSummary,
  fetchDowntimeByReason,
  fetchDowntimeByCategory,
  fetchDowntimeBySubSystem,
  fetchHaulageSummary,
  fetchHaulageByDumper,
  fetchFleetMatching,
  fetchStrippingRatio,
  fetchFuelCostSummary,
  fetchReliabilityMetrics,
  fetchInsights,
} from "../controllers/kpiController.js";

const router = Router();

// Summary & Executive KPIs
router.get("/summary", fetchSummary);
router.get("/insights", fetchInsights);

// Production Analytics
router.get("/production/daily", fetchDailyProduction);
router.get("/production/by-shift", fetchShiftProduction);
router.get("/production/by-material", fetchMaterialProduction);

// Equipment & Availability Analytics
router.get("/equipment/utilization", fetchEquipmentUtilization);
router.get("/equipment/summary", fetchEquipmentSummary);

// Downtime & Delay Analytics
router.get("/downtime/by-reason", fetchDowntimeByReason);
router.get("/downtime/by-category", fetchDowntimeByCategory);
router.get("/downtime/by-subsystem", fetchDowntimeBySubSystem);

// Haulage & Fleet Analytics
router.get("/haulage/summary", fetchHaulageSummary);
router.get("/haulage/by-dumper", fetchHaulageByDumper);
router.get("/fleet/matching", fetchFleetMatching);

// Material & Stripping Analytics
router.get("/materials/stripping-ratio", fetchStrippingRatio);

// Fuel & Operating Cost Analytics
router.get("/fuel/summary", fetchFuelCostSummary);

// Equipment Reliability (MTBF & MTTR)
router.get("/reliability/metrics", fetchReliabilityMetrics);

export default router;
