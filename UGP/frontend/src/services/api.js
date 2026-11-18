import axios from "axios";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl;
  }
  if (import.meta.env.PROD) {
    return "https://surface-mining-api.onrender.com/api";
  }
  return envUrl || "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

export const toQuery = (filters = {}) => {
  const query = {};
  if (filters.startDate) query.start = filters.startDate;
  if (filters.endDate) query.end = filters.endDate;
  if (filters.shift) query.shift = filters.shift;
  if (filters.equipmentType) query.type = filters.equipmentType;
  if (filters.materialCategory) query.material = filters.materialCategory;
  if (filters.equipmentId) query.equipmentId = filters.equipmentId;
  if (filters.page) query.page = filters.page;
  if (filters.limit) query.limit = filters.limit;
  return query;
};

// --- KPI & Analytics Services ---

export const getSummary = async (filters) => {
  const { data } = await api.get("/kpi/summary", { params: toQuery(filters) });
  return data;
};

export const getDailyProduction = async (filters) => {
  const { data } = await api.get("/kpi/production/daily", { params: toQuery(filters) });
  return data;
};

export const getShiftProduction = async (filters) => {
  const { data } = await api.get("/kpi/production/by-shift", { params: toQuery(filters) });
  return data;
};

export const getMaterialProduction = async (filters) => {
  const { data } = await api.get("/kpi/production/by-material", { params: toQuery(filters) });
  return data;
};

export const getEquipmentUtilization = async (filters) => {
  const { data } = await api.get("/kpi/equipment/utilization", { params: toQuery(filters) });
  return data;
};

// Alias for backward compatibility / legacy import name
export const getUtilization = getEquipmentUtilization;

export const getEquipmentSummary = async (filters) => {
  const { data } = await api.get("/kpi/equipment/summary", { params: toQuery(filters) });
  return data;
};

export const getDowntimeByReason = async (filters) => {
  const { data } = await api.get("/kpi/downtime/by-reason", { params: toQuery(filters) });
  return data;
};

export const getDowntimeByCategory = async (filters) => {
  const { data } = await api.get("/kpi/downtime/by-category", { params: toQuery(filters) });
  return data;
};

export const getDowntimeBySubSystem = async (filters) => {
  const { data } = await api.get("/kpi/downtime/by-subsystem", { params: toQuery(filters) });
  return data;
};

export const getHaulageSummary = async (filters) => {
  const { data } = await api.get("/kpi/haulage/summary", { params: toQuery(filters) });
  return data;
};

export const getHaulageByDumper = async (filters) => {
  const { data } = await api.get("/kpi/haulage/by-dumper", { params: toQuery(filters) });
  return data;
};

export const getFleetMatching = async (filters) => {
  const { data } = await api.get("/kpi/fleet/matching", { params: toQuery(filters) });
  return data;
};

export const getStrippingRatio = async (filters) => {
  const { data } = await api.get("/kpi/materials/stripping-ratio", { params: toQuery(filters) });
  return data;
};

export const getFuelCostSummary = async (filters) => {
  const { data } = await api.get("/kpi/fuel/summary", { params: toQuery(filters) });
  return data;
};

export const getReliabilityMetrics = async (filters) => {
  const { data } = await api.get("/kpi/reliability/metrics", { params: toQuery(filters) });
  return data;
};

export const getInsights = async (filters) => {
  const { data } = await api.get("/kpi/insights", { params: toQuery(filters) });
  return data;
};

// --- Master & Operational Data Services ---

export const getEquipment = async () => {
  const { data } = await api.get("/data/equipment");
  return data;
};

export const getMaterials = async () => {
  const { data } = await api.get("/data/materials");
  return data;
};

export const getMines = async () => {
  const { data } = await api.get("/data/mines");
  return data;
};

export const getDataSources = async () => {
  const { data } = await api.get("/data/sources");
  return data;
};

export const getBenchmarks = async () => {
  const { data } = await api.get("/data/benchmarks");
  return data;
};

export const getRawRecords = async (filters) => {
  const { data } = await api.get("/data/records", { params: toQuery(filters) });
  return data;
};

export const getHaulageCycles = async (filters) => {
  const { data } = await api.get("/data/cycles", { params: toQuery(filters) });
  return data;
};

export const getDowntimeEvents = async (filters) => {
  const { data } = await api.get("/data/downtime-events", { params: toQuery(filters) });
  return data;
};

export default api;
