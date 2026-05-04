import { Router } from "express";
import {
  listEquipment,
  listProductionTargets,
  listRawRecords,
} from "../controllers/dataController.js";

const router = Router();

router.get("/equipment", listEquipment);
router.get("/records", listRawRecords);
router.get("/targets", listProductionTargets);

export default router;
