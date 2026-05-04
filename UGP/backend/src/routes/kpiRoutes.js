import { Router } from "express";
import {
  fetchDailyProduction,
  fetchDowntimeByReason,
  fetchEquipmentUtilization,
  fetchShiftProduction,
  fetchSummary,
} from "../controllers/kpiController.js";

const router = Router();

router.get("/summary", fetchSummary);
router.get("/production/daily", fetchDailyProduction);
router.get("/production/by-shift", fetchShiftProduction);
router.get("/equipment/utilization", fetchEquipmentUtilization);
router.get("/downtime/by-reason", fetchDowntimeByReason);

export default router;
