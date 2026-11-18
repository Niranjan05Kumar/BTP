import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  getDowntimeByReason,
  getDowntimeByCategory,
  getDowntimeBySubSystem,
  getReliabilityMetrics,
} from "../services/api.js";

const PIE_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

const DowntimeReliabilityView = () => {
  const { filters, registerExportHandler } = useFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reasons, setReasons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subSystems, setSubSystems] = useState([]);
  const [reliability, setReliability] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadDowntime = async () => {
      setLoading(true);
      setError("");
      try {
        const [reasonsData, categoriesData, subsystemsData, reliabilityData] = await Promise.all([
          getDowntimeByReason(filters),
          getDowntimeByCategory(filters),
          getDowntimeBySubSystem(filters),
          getReliabilityMetrics(filters),
        ]);
        if (isMounted) {
          setReasons(reasonsData || []);
          setCategories(categoriesData || []);
          setSubSystems(subsystemsData || []);
          setReliability(reliabilityData || {});
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load downtime and reliability analytics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDowntime();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Aggregate Downtime Hours
  const totalDowntimeHours = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.downtimeHours || 0), 0);
  }, [categories]);

  // Register CSV Export
  useEffect(() => {
    registerExportHandler(() => {
      const rows = reliability.equipmentReliability || [];
      exportToCsv(rows, `equipment_reliability_mtbf_${filters.startDate}_to_${filters.endDate}.csv`, {
        equipmentId: "Asset Tag",
        equipmentType: "HEMM Type",
        operatingHours: "Operating Hours (h)",
        failures: "Qualifying Breakdown Count (Nf)",
        repairHours: "Active Repair Hours (h)",
        mtbfHours: "MTBF (Hours/Failure)",
        mttrHours: "MTTR (Hours/Repair)",
        failureRatePer100h: "Failures / 100 Op Hours",
        status: "Reliability Status",
      });
    });
  }, [reliability, filters, registerExportHandler]);

  return (
    <div className="dashboard-page">
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Downtime & Equipment Reliability Analysis</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              Pareto delay drivers, planned vs breakdown segregation, MTBF, and MTTR metrics
            </span>
          </div>
          <span className="badge badge-info">DGMS Failure & Maintenance Protocol</span>
        </div>
        <FiltersBar customExportLabel="Export Reliability CSV" showMaterial={false} />
      </section>

      {loading && <p className="status-text info">Loading downtime & reliability metrics...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && reasons.length === 0 && (
        <p className="status-text muted">No downtime events found for the selected filter parameters.</p>
      )}

      {!loading && !error && reasons.length > 0 && (
        <>
          {/* Key Reliability Metrics Ribbon */}
          <div className="grid-4">
            <div className="metric-box">
              <div className="label">Total Lost Downtime</div>
              <div className="num" style={{ color: "var(--danger)" }}>
                {totalDowntimeHours.toFixed(1)} <span style={{ fontSize: 13 }}>hrs</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Across all active fleet units</span>
            </div>

            <div className="metric-box">
              <div className="label">Fleet MTBF</div>
              <div className="num" style={{ color: "var(--accent)" }}>
                {reliability.fleetMtbfHours || 0} <span style={{ fontSize: 13 }}>hrs</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Mean Operating Hours Between Breakdowns</span>
            </div>

            <div className="metric-box">
              <div className="label">Fleet MTTR</div>
              <div
                className="num"
                style={{
                  color: (reliability.fleetMttrHours || 0) <= 2.5 ? "var(--success)" : "var(--warning)",
                }}
              >
                {reliability.fleetMttrHours || 0} <span style={{ fontSize: 13 }}>hrs</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Mean Wrench Repair Turnaround Time</span>
            </div>

            <div className="metric-box">
              <div className="label">Qualifying Failures</div>
              <div className="num" style={{ color: "#8b5cf6" }}>
                {reliability.totalQualifyingFailures || 0}
              </div>
              <span className="muted" style={{ fontSize: 11 }}>
                Total repair wrench time: {reliability.totalRepairHours || 0} hrs
              </span>
            </div>
          </div>

          {/* Downtime Categories & Pareto Reasons */}
          <div className="grid-2">
            {/* Category Donut */}
            <div className="chart-card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 4px" }}>Downtime by Classification</h3>
              <span className="muted" style={{ fontSize: 12 }}>
                Planned Maintenance vs Unplanned Breakdown vs Operational Delay
              </span>
              <div style={{ height: 280, position: "relative", marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="downtimeHours"
                      nameKey="category"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} hrs`]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sub-System Bar Chart */}
            <div className="chart-card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 4px" }}>Downtime Hours by Mechanical Sub-System</h3>
              <span className="muted" style={{ fontSize: 12 }}>
                Root cause mechanical assembly failure distribution
              </span>
              <div style={{ height: 280, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subSystems} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="subSystem" />
                    <YAxis unit=" h" />
                    <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} hrs`]} />
                    <Legend />
                    <Bar dataKey="downtimeHours" fill="#f59e0b" name="Downtime Hours" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pareto Reasons Table */}
          <section className="surface-card data-page-card" style={{ marginBottom: 24 }}>
            <div className="section-head">
              <div>
                <h3 style={{ margin: 0 }}>Pareto Downtime Event Drivers</h3>
                <span className="chart-meta">Sorted by highest cumulative hours lost</span>
              </div>
              <div className="table-badge">{reasons.length} delay drivers</div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stoppage Reason</th>
                    <th>Category</th>
                    <th>Mechanical Sub-System</th>
                    <th className="num-col">Total Lost Hours</th>
                    <th className="num-col">Active Repair Hours</th>
                    <th className="num-col">Event Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {reasons.map((r) => (
                    <tr key={r.reason}>
                      <td style={{ fontWeight: 600 }}>{r.reason}</td>
                      <td>
                        <span
                          className={`badge ${
                            r.category === "Unplanned Breakdown"
                              ? "badge-danger"
                              : r.category === "Planned Maintenance"
                              ? "badge-info"
                              : "badge-warning"
                          }`}
                        >
                          {r.category}
                        </span>
                      </td>
                      <td>{r.subSystem}</td>
                      <td className="num-col">{Number(r.downtimeHours).toFixed(1)} h</td>
                      <td className="num-col">{Number(r.repairHours).toFixed(1)} h</td>
                      <td className="num-col">{r.eventCount} events</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Equipment Reliability: MTBF & MTTR Table */}
          <section className="surface-card data-page-card">
            <div className="section-head">
              <div>
                <h3 style={{ margin: 0 }}>Equipment Reliability Index (MTBF & MTTR)</h3>
                <span className="chart-meta">
                  Calculated strictly from qualifying breakdown events (planned maintenance excluded)
                </span>
              </div>
              <div className="table-badge">
                {(reliability.equipmentReliability || []).length} units evaluated
              </div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>HEMM Type</th>
                    <th className="num-col">Operating Time</th>
                    <th className="num-col">Breakdowns (Nf)</th>
                    <th className="num-col">Repair Wrench Time</th>
                    <th className="num-col">MTBF (Operating h / Failure)</th>
                    <th className="num-col">MTTR (Repair h / Failure)</th>
                    <th className="num-col">Failures / 100h</th>
                    <th>Reliability Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(reliability.equipmentReliability || []).map((eq) => (
                    <tr key={eq.equipmentId}>
                      <td style={{ fontWeight: 600 }}>{eq.equipmentId}</td>
                      <td>
                        <span className="pill pill-soft">{eq.equipmentType}</span>
                      </td>
                      <td className="num-col">{Number(eq.operatingHours).toFixed(1)} h</td>
                      <td className="num-col">{eq.failures}</td>
                      <td className="num-col">{Number(eq.repairHours).toFixed(1)} h</td>
                      <td className="num-col">
                        <span style={{ fontWeight: 700, color: eq.mtbfHours >= 50 ? "var(--success)" : "var(--warning)" }}>
                          {Number(eq.mtbfHours).toFixed(1)} h
                        </span>
                      </td>
                      <td className="num-col">{Number(eq.mttrHours).toFixed(1)} h</td>
                      <td className="num-col">{Number(eq.failureRatePer100h).toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${
                            eq.status === "Good"
                              ? "badge-success"
                              : eq.status === "Moderate"
                              ? "badge-warning"
                              : "badge-danger"
                          }`}
                        >
                          {eq.status}
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

export default DowntimeReliabilityView;

