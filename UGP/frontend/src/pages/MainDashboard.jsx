import { useEffect, useState, useMemo } from "react";
import SummaryCards from "../components/Dashboard/SummaryCards.jsx";
import ProductionChart from "../components/Dashboard/ProductionChart.jsx";
import ShiftProductionChart from "../components/Dashboard/ShiftProductionChart.jsx";
import UtilizationChart from "../components/Dashboard/UtilizationChart.jsx";
import DowntimeChart from "../components/Dashboard/DowntimeChart.jsx";
import InsightsPanel from "../components/Dashboard/InsightsPanel.jsx";
import FiltersBar from "../components/Filters/FiltersBar.jsx";
import { useFilters } from "../context/FilterContext.jsx";
import { exportToCsv } from "../utils/exportCsv.js";
import {
  getDailyProduction,
  getDowntimeByReason,
  getShiftProduction,
  getSummary,
  getUtilization,
  getHaulageSummary,
  getFuelCostSummary,
  getInsights,
} from "../services/api.js";

const MainDashboard = () => {
  const { filters, registerExportHandler } = useFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({});
  const [dailyProduction, setDailyProduction] = useState([]);
  const [shiftProduction, setShiftProduction] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [downtimeReasons, setDowntimeReasons] = useState([]);
  const [haulageSummary, setHaulageSummary] = useState({});
  const [fuelSummary, setFuelSummary] = useState({});
  const [insightsData, setInsightsData] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          summaryData,
          dailyData,
          utilizationData,
          downtimeData,
          shiftData,
          haulageData,
          fuelData,
          insightsResult,
        ] = await Promise.all([
          getSummary(filters),
          getDailyProduction(filters),
          getUtilization(filters),
          getDowntimeByReason(filters),
          getShiftProduction(filters),
          getHaulageSummary(filters),
          getFuelCostSummary(filters),
          getInsights(filters),
        ]);

        if (isMounted) {
          setSummary(summaryData);
          setDailyProduction(dailyData || []);
          setUtilization(utilizationData || []);
          setDowntimeReasons(downtimeData || []);
          setShiftProduction(shiftData || []);
          setHaulageSummary(haulageData || {});
          setFuelSummary(fuelData || {});
          setInsightsData(insightsResult?.insights || []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError?.response?.data?.message || "Failed to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Register CSV Export for Overview
  useEffect(() => {
    registerExportHandler(() => {
      exportToCsv(dailyProduction, `production_overview_${filters.startDate}_to_${filters.endDate}.csv`, {
        date: "Date",
        actual: "Actual Production (t)",
        target: "Budget Target (t)",
        variance: "Variance (t)",
        attainment: "Attainment %",
      });
    });
  }, [dailyProduction, filters, registerExportHandler]);

  const hasData = useMemo(() => {
    return (
      dailyProduction.length > 0 ||
      shiftProduction.length > 0 ||
      utilization.length > 0 ||
      downtimeReasons.length > 0
    );
  }, [dailyProduction, downtimeReasons, shiftProduction, utilization]);

  return (
    <div className="dashboard-page">
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Executive Operations Overview</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              Consolidated mining performance, machine availability, and operational KPIs
            </span>
          </div>
          <span className="badge badge-info">Synthetic 30-Day Simulation Dataset</span>
        </div>
        <FiltersBar customExportLabel="Export Production CSV" />
      </section>

      {loading && <p className="status-text info">Loading consolidated operational metrics...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && !hasData && (
        <p className="status-text muted">No operational records found for the selected filter parameters.</p>
      )}

      {!loading && !error && hasData && (
        <>
          <SummaryCards
            summary={summary}
            dailyProduction={dailyProduction}
            haulageSummary={haulageSummary}
            fuelSummary={fuelSummary}
          />

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
