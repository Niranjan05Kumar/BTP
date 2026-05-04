import { useEffect, useMemo, useState } from "react";
import SummaryCards from "../components/Dashboard/SummaryCards.jsx";
import ProductionChart from "../components/Dashboard/ProductionChart.jsx";
import ShiftProductionChart from "../components/Dashboard/ShiftProductionChart.jsx";
import UtilizationChart from "../components/Dashboard/UtilizationChart.jsx";
import DowntimeChart from "../components/Dashboard/DowntimeChart.jsx";
import InsightsPanel from "../components/Dashboard/InsightsPanel.jsx";
import FiltersBar from "../components/Filters/FiltersBar.jsx";
import {
  getDailyProduction,
  getDowntimeByReason,
  getShiftProduction,
  getSummary,
  getUtilization,
} from "../services/api.js";

const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 13);

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    shift: "all",
    equipmentType: "all",
  };
};

const MainDashboard = () => {
  const [filters, setFilters] = useState(getDefaultDateRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({});
  const [dailyProduction, setDailyProduction] = useState([]);
  const [shiftProduction, setShiftProduction] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [downtimeReasons, setDowntimeReasons] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [summaryData, dailyData, utilizationData, downtimeData] = await Promise.all([
          getSummary(filters),
          getDailyProduction(filters),
          getUtilization(filters),
          getDowntimeByReason(filters),
        ]);

        const shiftData = await getShiftProduction(filters);

        setSummary(summaryData);
        setDailyProduction(dailyData);
        setUtilization(utilizationData);
        setDowntimeReasons(downtimeData);
        setShiftProduction(shiftData);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const hasData = useMemo(() => dailyProduction.length > 0 || shiftProduction.length > 0 || utilization.length > 0 || downtimeReasons.length > 0, [
    dailyProduction,
    downtimeReasons,
    shiftProduction,
    utilization,
  ]);

  return (
    <div className="dashboard-page">
      <section>
        <FiltersBar
          startDate={filters.startDate}
          endDate={filters.endDate}
          shift={filters.shift}
          equipmentType={filters.equipmentType}
          onChange={updateFilter}
        />
      </section>

      {loading && <p className="status-text info">Loading dashboard...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && !hasData && <p className="status-text muted">No records found for selected filters.</p>}

      {!loading && !error && hasData && (
        <>
          <SummaryCards summary={summary} />
          <div className="dashboard-grid">
            <div className="dashboard-slot dashboard-slot--production">
              <ProductionChart data={dailyProduction} />
            </div>

            <aside className="dashboard-slot dashboard-slot--insights">
              <InsightsPanel summary={summary} downtimeReasons={downtimeReasons} />
            </aside>

            <div className="dashboard-slot dashboard-slot--downtime">
              <DowntimeChart data={downtimeReasons} />
            </div>

            <div className="dashboard-slot dashboard-slot--shift">
              <ShiftProductionChart data={shiftProduction} />
            </div>

            <div className="dashboard-slot dashboard-slot--utilization">
              <UtilizationChart data={utilization} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainDashboard;
