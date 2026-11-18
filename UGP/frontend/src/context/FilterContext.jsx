import { createContext, useContext, useState, useRef, useCallback } from "react";
import { exportToCsv } from "../utils/exportCsv.js";

const FilterContext = createContext(null);

export const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  // Cover 29 days prior through today = 30 full days
  startDate.setDate(endDate.getDate() - 29);

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    shift: "all",
    equipmentType: "all",
    materialCategory: "all",
  };
};

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(getDefaultDateRange);
  const exportHandlerRef = useRef(null);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(getDefaultDateRange());
  }, []);

  const registerExportHandler = useCallback((handler) => {
    exportHandlerRef.current = handler;
  }, []);

  const triggerExport = useCallback((fallbackData = null, filename = "mining_dashboard_export.csv") => {
    if (typeof exportHandlerRef.current === "function") {
      exportHandlerRef.current();
    } else if (Array.isArray(fallbackData) && fallbackData.length > 0) {
      exportToCsv(fallbackData, filename);
    } else {
      alert("No exportable data available for the current active view.");
    }
  }, []);

  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilter,
        resetFilters,
        registerExportHandler,
        triggerExport,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};

export default FilterContext;

