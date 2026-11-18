import Mine from "../models/Mine.js";
import Material from "../models/Material.js";
import Equipment from "../models/Equipment.js";
import DataSource from "../models/DataSource.js";
import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import ProductionTarget from "../models/ProductionTarget.js";
import HaulageCycleRecord from "../models/HaulageCycleRecord.js";
import DowntimeEvent from "../models/DowntimeEvent.js";
import MineProductionRecord from "../models/MineProductionRecord.js";

export const listMines = async (req, res, next) => {
  try {
    const data = await Mine.find().sort({ mineId: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listMaterials = async (req, res, next) => {
  try {
    const data = await Material.find().sort({ category: 1, name: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listEquipment = async (req, res, next) => {
  try {
    const data = await Equipment.find().sort({ type: 1, equipmentId: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listDataSources = async (req, res, next) => {
  try {
    const data = await DataSource.find().sort({ sourceType: 1, sourceId: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listBenchmarks = async (req, res, next) => {
  try {
    const data = await MineProductionRecord.find().sort({ organization: 1, mineName: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listRawRecords = async (req, res, next) => {
  try {
    const {
      start,
      end,
      shift,
      type,
      equipmentId,
      material,
      materialCategory,
      page = 1,
      limit = 100,
    } = req.query;

    const query = {};

    if (start && end) {
      query.date = {
        $gte: new Date(`${start}T00:00:00.000Z`),
        $lte: new Date(`${end}T23:59:59.999Z`),
      };
    }

    if (shift && shift !== "all") {
      query.shiftCode = shift;
    }

    if (type && type !== "all") {
      query.equipmentType = type;
    }

    if (equipmentId && equipmentId !== "all") {
      query.equipmentId = equipmentId;
    }

    const selectedMaterial = material || materialCategory;
    if (selectedMaterial && selectedMaterial !== "all") {
      query.materialCategory = selectedMaterial;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(Math.max(1, Number(limit) || 100), 1000);
    const skip = (pageNum - 1) * parsedLimit;

    const [total, records] = await Promise.all([
      ShiftEquipmentRecord.countDocuments(query),
      ShiftEquipmentRecord.find(query)
        .sort({ date: -1, shiftCode: 1, equipmentId: 1 })
        .skip(skip)
        .limit(parsedLimit),
    ]);

    res.json({
      total,
      page: pageNum,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      records,
    });
  } catch (error) {
    next(error);
  }
};

export const listHaulageCycles = async (req, res, next) => {
  try {
    const { start, end, shift, dumperId, shovelId, page = 1, limit = 100 } = req.query;
    const query = {};

    if (start && end) {
      query.date = {
        $gte: new Date(`${start}T00:00:00.000Z`),
        $lte: new Date(`${end}T23:59:59.999Z`),
      };
    }

    if (shift && shift !== "all") {
      query.shiftCode = shift;
    }

    if (dumperId && dumperId !== "all") {
      query.dumperId = dumperId;
    }

    if (shovelId && shovelId !== "all") {
      query.shovelId = shovelId;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(Math.max(1, Number(limit) || 100), 1000);
    const skip = (pageNum - 1) * parsedLimit;

    const [total, records] = await Promise.all([
      HaulageCycleRecord.countDocuments(query),
      HaulageCycleRecord.find(query)
        .sort({ date: -1, shiftCode: 1, dumperId: 1 })
        .skip(skip)
        .limit(parsedLimit),
    ]);

    res.json({
      total,
      page: pageNum,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      records,
    });
  } catch (error) {
    next(error);
  }
};

export const listDowntimeEvents = async (req, res, next) => {
  try {
    const { start, end, shift, equipmentId, category, isFailure } = req.query;
    const query = {};

    if (start && end) {
      query.date = {
        $gte: new Date(`${start}T00:00:00.000Z`),
        $lte: new Date(`${end}T23:59:59.999Z`),
      };
    }

    if (shift && shift !== "all") {
      query.shiftCode = shift;
    }

    if (equipmentId && equipmentId !== "all") {
      query.equipmentId = equipmentId;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (isFailure !== undefined) {
      query.isFailure = isFailure === "true";
    }

    const data = await DowntimeEvent.find(query)
      .sort({ date: -1, shiftCode: 1, equipmentId: 1 })
      .limit(500);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listProductionTargets = async (req, res, next) => {
  try {
    const data = await ProductionTarget.find().sort({ date: 1, shiftCode: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};
