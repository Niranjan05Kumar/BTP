import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

const toQuery = (filters) => ({
  start: filters.startDate,
  end: filters.endDate,
  shift: filters.shift || "all",
  type: filters.equipmentType || "all",
});

export const getSummary = async (filters) => {
  const { data } = await api.get("/kpi/summary", { params: toQuery(filters) });
  return data;
};

export const getDailyProduction = async (filters) => {
  const { data } = await api.get("/kpi/production/daily", { params: toQuery(filters) });
  return data;
};

export const getShiftProduction = async (filters) => {
  const { data } = await api.get("/kpi/production/by-shift", {
    params: toQuery(filters),
  });
  return data;
};

export const getUtilization = async (filters) => {
  const { data } = await api.get("/kpi/equipment/utilization", { params: toQuery(filters) });
  return data;
};

export const getDowntimeByReason = async (filters) => {
  const { data } = await api.get("/kpi/downtime/by-reason", { params: toQuery(filters) });
  return data;
};

export const getEquipment = async () => {
  const { data } = await api.get("/data/equipment");
  return data;
};

export const getRawRecords = async (filters) => {
  const { data } = await api.get("/data/records", {
    params: {
      ...toQuery(filters),
      limit: 500,
    },
  });
  return data;
};

export default api;
