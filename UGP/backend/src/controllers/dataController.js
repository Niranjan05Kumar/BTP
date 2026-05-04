import Equipment from "../models/Equipment.js";
import ShiftEquipmentRecord from "../models/ShiftEquipmentRecord.js";
import ProductionTarget from "../models/ProductionTarget.js";

export const listEquipment = async (req, res, next) => {
  try {
    const data = await Equipment.find().sort({ equipmentId: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listRawRecords = async (req, res, next) => {
  try {
    const { start, end, limit = 300 } = req.query;
    const query = {};

    if (start && end) {
      query.date = {
        $gte: new Date(`${start}T00:00:00.000Z`),
        $lte: new Date(`${end}T23:59:59.999Z`),
      };
    }

    const parsedLimit = Math.min(Number(limit) || 300, 1000);

    const data = await ShiftEquipmentRecord.find(query)
      .sort({ date: -1, shiftCode: 1, equipmentId: 1 })
      .limit(parsedLimit);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listProductionTargets = async (req, res, next) => {
  try {
    const data = await ProductionTarget.find().sort({ date: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
};
