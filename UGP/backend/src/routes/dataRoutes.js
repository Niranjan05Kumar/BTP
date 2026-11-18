import { Router } from "express";
import {
  listMines,
  listMaterials,
  listEquipment,
  listDataSources,
  listBenchmarks,
  listRawRecords,
  listHaulageCycles,
  listDowntimeEvents,
  listProductionTargets,
} from "../controllers/dataController.js";

const router = Router();

// Master Data Lists
router.get("/mines", listMines);
router.get("/materials", listMaterials);
router.get("/equipment", listEquipment);
router.get("/sources", listDataSources);
router.get("/benchmarks", listBenchmarks);

// Operational Event & Fact Lists
router.get("/records", listRawRecords);
router.get("/cycles", listHaulageCycles);
router.get("/downtime-events", listDowntimeEvents);
router.get("/targets", listProductionTargets);

export default router;
