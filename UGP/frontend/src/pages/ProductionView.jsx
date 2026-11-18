import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  getDailyProduction,
  getShiftProduction,
  getMaterialProduction,
} from "../services/api.js";

const ProductionView = () => {
  const { filters, registerExportHandler } = useFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dailyData, setDailyData] = useState([]);
  const [shiftData, setShiftData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const [chartMode, setChartMode] = useState("area");

  useEffect(() => {
    let isMounted = true;
    const fetchProduction = async () => {
      setLoading(true);
      setError("");
      try {
        const [daily, shift, material] = await Promise.all([
          getDailyProduction(filters),
          getShiftProduction(filters),
          getMaterialProduction(filters),
        ]);
        if (isMounted) {
          setDailyData(daily || []);
          setShiftData(shift || []);
          setMaterialData(material || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load production analytics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduction();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Cumulative production series
  const cumulativeData = useMemo(() => {
    let runningActual = 0;
    let runningTarget = 0;
    return dailyData.map((d) => {
      runningActual += d.actual || 0;
      runningTarget += d.target || 0;
      return {
        date: d.date,
        cumulativeActual: Number(runningActual.toFixed(2)),
        cumulativeTarget: Number(runningTarget.toFixed(2)),
      };
    });
  }, [dailyData]);

  // Production Totals & Variance
  const stats = useMemo(() => {
    const totalActual = dailyData.reduce((s, d) => s + (d.actual || 0), 0);
    const totalTarget = dailyData.reduce((s, d) => s + (d.target || 0), 0);
    const totalVariance = totalActual - totalTarget;
    const attainment = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
    const avgDaily = dailyData.length > 0 ? totalActual / dailyData.length : 0;
    const lossTonnes = totalVariance < 0 ? Math.abs(totalVariance) : 0;

    return {
      totalActual: Number(totalActual.toFixed(2)),
      totalTarget: Number(totalTarget.toFixed(2)),
      totalVariance: Number(totalVariance.toFixed(2)),
      attainment: Number(attainment.toFixed(1)),
      avgDaily: Number(avgDaily.toFixed(2)),
      lossTonnes: Number(lossTonnes.toFixed(2)),
    };
  }, [dailyData]);

  // Register CSV Export
  useEffect(() => {
    registerExportHandler(() => {
      exportToCsv(dailyData, `daily_production_${filters.startDate}_to_${filters.endDate}.csv`, {
        date: "Date",
        actual: "Actual Tonnes",
        target: "Budget Target Tonnes",
        variance: "Variance Tonnes",
        attainment: "Attainment %",
      });
    });
  }, [dailyData, filters, registerExportHandler]);

  return (
    <div className="dashboard-page">
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Production Performance Analysis</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              Daily extraction vs target, shift variations, material partitioning, and cumulative output
            </span>
          </div>
          <span className="badge badge-info">Canonical Dumper Delivered Tonnage</span>
        </div>
        <FiltersBar customExportLabel="Export Production CSV" />
      </section>

      {loading && <p className="status-text info">Loading production performance records...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && dailyData.length === 0 && (
        <p className="status-text muted">No production records found for the selected filter parameters.</p>
      )}

      {!loading && !error && dailyData.length > 0 && (
        <>
          {/* Summary Metric Ribbon */}
          <div className="grid-4">
            <div className="metric-box">
              <div className="label">Total Extracted</div>
              <div className="num" style={{ color: "var(--accent)" }}>
                {stats.totalActual.toLocaleString()} <span style={{ fontSize: 13 }}>t</span>
              </div>
            </div>
            <div className="metric-box">
              <div className="label">Budget Target</div>
              <div className="num">
                {stats.totalTarget.toLocaleString()} <span style={{ fontSize: 13 }}>t</span>
              </div>
            </div>
            <div className="metric-box">
              <div className="label">Plan Attainment</div>
              <div className="num" style={{ color: stats.attainment >= 95 ? "var(--success)" : "var(--warning)" }}>
                {stats.attainment}%
              </div>
            </div>
            <div className="metric-box">
              <div className="label">Production Variance</div>
              <div
                className="num"
                style={{ color: stats.totalVariance >= 0 ? "var(--success)" : "var(--danger)" }}
              >
                {stats.totalVariance >= 0 ? "+" : ""}
                {stats.totalVariance.toLocaleString()} <span style={{ fontSize: 13 }}>t</span>
              </div>
            </div>
          </div>

          {/* Primary Daily Chart */}
          <div className="chart-card" style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>Daily Actual Production vs Budget Target</h3>
                <span className="muted" style={{ fontSize: 12 }}>
                  Tonnage hauled to surface dump/siding per 24-hr day
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className={`icon-btn text-btn ${chartMode === "area" ? "active" : ""}`}
                  onClick={() => setChartMode("area")}
                >
                  Area
                </button>
                <button
                  type="button"
                  className={`icon-btn text-btn ${chartMode === "line" ? "active" : ""}`}
                  onClick={() => setChartMode("line")}
                >
                  Line
                </button>
              </div>
            </div>

            <div style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === "area" ? (
                  <AreaChart data={dailyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis unit=" t" />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} t`]} />
                    <Legend />
                    <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} fill="url(#prodGrad)" name="Actual Tonnage" />
                    <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Budget Target" />
                  </AreaChart>
                ) : (
                  <LineChart data={dailyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis unit=" t" />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} t`]} />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2.5} name="Actual Tonnage" />
                    <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Budget Target" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary 2-Column Grids */}
          <div className="grid-2">
            {/* Cumulative Output */}
            <div className="chart-card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 4px" }}>Cumulative Production Progression</h3>
              <span className="muted" style={{ fontSize: 12 }}>Tracking cumulative pace against period budget</span>
              <div style={{ height: 260, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cumulativeData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis unit=" t" />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} t`]} />
                    <Legend />
                    <Line type="monotone" dataKey="cumulativeActual" stroke="#10b981" strokeWidth={2.5} dot={false} name="Cumulative Actual" />
                    <Line type="monotone" dataKey="cumulativeTarget" stroke="#6b7280" strokeDasharray="3 3" dot={false} name="Cumulative Target" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Shift Breakdown */}
            <div className="chart-card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 4px" }}>Shift Production Distribution</h3>
              <span className="muted" style={{ fontSize: 12 }}>Extraction balance across Shift A, B, and C</span>
              <div style={{ height: 260, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shiftData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="shiftCode" />
                    <YAxis unit=" t" />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} t`]} />
                    <Legend />
                    <Bar dataKey="production" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Extracted Tonnes" barSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Material Partitioning Table */}
          <section className="surface-card data-page-card" style={{ marginTop: 24 }}>
            <div className="section-head">
              <div>
                <h3 style={{ margin: 0 }}>Material Stratum Production Breakdown</h3>
                <span className="chart-meta">Tonnage, in-situ bank volume (BCM), and total haulage trips</span>
              </div>
              <div className="table-badge">{materialData.length} materials tracked</div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Material Code</th>
                    <th>Category</th>
                    <th className="num-col">Tonnage Extracted</th>
                    <th className="num-col">Volume (BCM)</th>
                    <th className="num-col">Total Trips</th>
                    <th className="num-col">Avg Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {materialData.map((m) => (
                    <tr key={m.materialId}>
                      <td style={{ fontWeight: 600 }}>{m.materialId}</td>
                      <td>
                        <span className={`badge ${m.materialCategory === "Mineral" ? "badge-success" : "badge-info"}`}>
                          {m.materialCategory}
                        </span>
                      </td>
                      <td className="num-col">{Number(m.tonnage).toLocaleString()} t</td>
                      <td className="num-col">{Number(m.volumeBcm).toLocaleString()} BCM</td>
                      <td className="num-col">{m.trips.toLocaleString()}</td>
                      <td className="num-col">
                        {m.trips > 0 ? (m.tonnage / m.trips).toFixed(1) : 0} t/trip
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

export default ProductionView;

