import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import FiltersBar from "../components/Filters/FiltersBar.jsx";
import { useFilters } from "../context/FilterContext.jsx";
import { exportToCsv } from "../utils/exportCsv.js";
import { getHaulageSummary, getHaulageByDumper } from "../services/api.js";

const HaulageView = () => {
  const { filters, registerExportHandler } = useFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({});
  const [dumperCycles, setDumperCycles] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadHaulage = async () => {
      setLoading(true);
      setError("");
      try {
        const [sumData, dumperData] = await Promise.all([
          getHaulageSummary(filters),
          getHaulageByDumper(filters),
        ]);
        if (isMounted) {
          setSummary(sumData || {});
          setDumperCycles(dumperData || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load haulage cycle kinematics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHaulage();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Register CSV Export
  useEffect(() => {
    registerExportHandler(() => {
      exportToCsv(dumperCycles, `haulage_cycles_${filters.startDate}_to_${filters.endDate}.csv`, {
        dumperId: "Haul Truck ID",
        trips: "Completed Trips",
        totalTonnage: "Hauled Tonnage (t)",
        avgPayload: "Avg Payload (t)",
        avgQueueWait: "Queue Wait (min)",
        avgSpotLoad: "Spot & Load (min)",
        avgLoadedTravel: "Loaded Haul (min)",
        avgSpotDump: "Dump Time (min)",
        avgEmptyReturn: "Empty Return (min)",
        avgCycleTime: "Total Cycle Time (min)",
        queuePercent: "Queue Delay %",
      });
    });
  }, [dumperCycles, filters, registerExportHandler]);

  return (
    <div className="dashboard-page">
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Haulage Cycle-Time & Kinematic Analysis</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              5-Phase discrete cycle components (Queue, Load, Haul, Dump, Return), queue delay ratios, and dumper productivity
            </span>
          </div>
          <span className="badge badge-info">Surface Haulage Kinematics Model</span>
        </div>
        <FiltersBar customExportLabel="Export Haulage CSV" showMaterial={false} />
      </section>

      {loading && <p className="status-text info">Loading haulage cycle records...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && dumperCycles.length === 0 && (
        <p className="status-text muted">No haulage trip cycles found for the selected filter parameters.</p>
      )}

      {!loading && !error && dumperCycles.length > 0 && (
        <>
          {/* Cycle Metrics Ribbon */}
          <div className="grid-4">
            <div className="metric-box">
              <div className="label">Mean Total Cycle Time (Tc)</div>
              <div className="num" style={{ color: "var(--accent)" }}>
                {summary.averageCycleMinutes || 0} <span style={{ fontSize: 13 }}>min</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>
                Total completed trips: {Number(summary.totalTrips || 0).toLocaleString()}
              </span>
            </div>

            <div className="metric-box">
              <div className="label">Queue Delay Contribution</div>
              <div
                className="num"
                style={{
                  color: (summary.queueContributionPercent || 0) > 18 ? "var(--danger)" : "var(--success)",
                }}
              >
                {summary.queueContributionPercent || 0}%
              </div>
              <span className="muted" style={{ fontSize: 11 }}>
                Avg bench wait: {summary.queueWaitMinutes || 0} min / trip
              </span>
            </div>

            <div className="metric-box">
              <div className="label">Dumper Hourly Output</div>
              <div className="num" style={{ color: "#10b981" }}>
                {summary.dumperHourlyProductivity || 0} <span style={{ fontSize: 13 }}>t/hr</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>
                Avg payload: {summary.averagePayloadTonnes || 0} tonnes
              </span>
            </div>

            <div className="metric-box">
              <div className="label">Total Hauled Payload</div>
              <div className="num" style={{ color: "#8b5cf6" }}>
                {Number(summary.totalPayloadTonnes || 0).toLocaleString()} <span style={{ fontSize: 13 }}>t</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Delivered to crushers & spoil dumps</span>
            </div>
          </div>

          {/* 5-Phase Cycle Composition Stacked Bar Chart */}
          <div className="chart-card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 4px" }}>Haulage Cycle Time Phase Breakdown (Tc = tw + tl + th + td + tr)</h3>
            <span className="muted" style={{ fontSize: 12 }}>
              Non-overlapping phase components per haul truck in minutes
            </span>
            <div style={{ height: 320, marginTop: 14 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dumperCycles} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dumperId" />
                  <YAxis unit=" min" />
                  <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} min`]} />
                  <Legend />
                  <Bar dataKey="avgQueueWait" stackId="cycle" fill="#ef4444" name="1. Queue & Waiting Time (tw)" />
                  <Bar dataKey="avgSpotLoad" stackId="cycle" fill="#f59e0b" name="2. Spot & Loading Time (tl)" />
                  <Bar dataKey="avgLoadedTravel" stackId="cycle" fill="#3b82f6" name="3. Loaded Transit (th)" />
                  <Bar dataKey="avgSpotDump" stackId="cycle" fill="#8b5cf6" name="4. Spot & Dump Time (td)" />
                  <Bar dataKey="avgEmptyReturn" stackId="cycle" fill="#10b981" name="5. Empty Return (tr)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dumper Fleet Comparison Table */}
          <section className="surface-card data-page-card">
            <div className="section-head">
              <div>
                <h3 style={{ margin: 0 }}>Dumper Fleet Haulage Performance Ledger</h3>
                <span className="chart-meta">Cycle metrics, payload weights, and queue delay percentages</span>
              </div>
              <div className="table-badge">{dumperCycles.length} haul trucks operating</div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Haul Truck</th>
                    <th className="num-col">Trips</th>
                    <th className="num-col">Total Hauled</th>
                    <th className="num-col">Avg Payload</th>
                    <th className="num-col">Queue Wait</th>
                    <th className="num-col">Spot & Load</th>
                    <th className="num-col">Loaded Haul</th>
                    <th className="num-col">Dump Time</th>
                    <th className="num-col">Empty Return</th>
                    <th className="num-col">Total Cycle (Tc)</th>
                    <th className="num-col">Queue Delay %</th>
                  </tr>
                </thead>
                <tbody>
                  {dumperCycles.map((d) => (
                    <tr key={d.dumperId}>
                      <td style={{ fontWeight: 600 }}>{d.dumperId}</td>
                      <td className="num-col">{d.trips}</td>
                      <td className="num-col">{Number(d.totalTonnage).toLocaleString()} t</td>
                      <td className="num-col">{Number(d.avgPayload).toFixed(1)} t</td>
                      <td className="num-col" style={{ color: d.avgQueueWait > 4 ? "var(--danger)" : "inherit" }}>
                        {Number(d.avgQueueWait).toFixed(1)} m
                      </td>
                      <td className="num-col">{Number(d.avgSpotLoad).toFixed(1)} m</td>
                      <td className="num-col">{Number(d.avgLoadedTravel).toFixed(1)} m</td>
                      <td className="num-col">{Number(d.avgSpotDump).toFixed(1)} m</td>
                      <td className="num-col">{Number(d.avgEmptyReturn).toFixed(1)} m</td>
                      <td className="num-col" style={{ fontWeight: 700 }}>
                        {Number(d.avgCycleTime).toFixed(1)} min
                      </td>
                      <td className="num-col">
                        <span
                          className={`badge ${
                            Number(d.queuePercent) > 20
                              ? "badge-danger"
                              : Number(d.queuePercent) > 15
                              ? "badge-warning"
                              : "badge-success"
                          }`}
                        >
                          {Number(d.queuePercent).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HaulageView;

