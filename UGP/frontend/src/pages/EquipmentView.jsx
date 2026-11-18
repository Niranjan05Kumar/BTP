import { useEffect, useState, useMemo } from "react";
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
import { getEquipmentUtilization, getEquipmentSummary } from "../services/api.js";

const EquipmentView = () => {
  const { filters, registerExportHandler } = useFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [equipmentList, setEquipmentList] = useState([]);
  const [fleetSummary, setFleetSummary] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadEquipment = async () => {
      setLoading(true);
      setError("");
      try {
        const [utilData, summaryData] = await Promise.all([
          getEquipmentUtilization(filters),
          getEquipmentSummary(filters),
        ]);
        if (isMounted) {
          setEquipmentList(utilData || []);
          setFleetSummary(summaryData || {});
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load equipment performance analytics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEquipment();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Hours breakdown data formatted for stacked bar
  const hoursData = useMemo(() => {
    return equipmentList.map((eq) => ({
      equipmentId: eq.equipmentId,
      operatingHours: eq.operatingHours,
      idleHours: eq.idleHours,
      maintenanceHours: eq.maintenanceHours,
    }));
  }, [equipmentList]);

  // Register CSV Export
  useEffect(() => {
    registerExportHandler(() => {
      exportToCsv(equipmentList, `equipment_performance_${filters.startDate}_to_${filters.endDate}.csv`, {
        equipmentId: "Asset Tag",
        equipmentType: "HEMM Type",
        scheduledHours: "Scheduled (h)",
        operatingHours: "Operating (h)",
        idleHours: "Idle (h)",
        maintenanceHours: "Maintenance (h)",
        mechanicalAvailability: "Availability %",
        utilization: "Utilization %",
        useOfAvailability: "Use of Avail %",
        productivityTonPerHour: "Productivity (t/h)",
      });
    });
  }, [equipmentList, filters, registerExportHandler]);

  return (
    <div className="dashboard-page">
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Equipment Fleet Performance & Availability</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              Mechanical Availability (MA), Operating Utilization (OU), Use of Availability (UA), and Shift Hour Reconciliations
            </span>
          </div>
          <span className="badge badge-info">16 Active Surface HEMM Fleet</span>
        </div>
        <FiltersBar customExportLabel="Export Fleet CSV" showMaterial={false} />
      </section>

      {loading && <p className="status-text info">Loading equipment fleet metrics...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && equipmentList.length === 0 && (
        <p className="status-text muted">No equipment records found for the selected filter parameters.</p>
      )}

      {!loading && !error && equipmentList.length > 0 && (
        <>
          {/* Fleet Aggregate Metric Ribbon */}
          <div className="grid-4">
            <div className="metric-box">
              <div className="label">Fleet Availability (MA)</div>
              <div
                className="num"
                style={{
                  color: (fleetSummary.averageAvailability || 0) >= 80 ? "var(--success)" : "var(--danger)",
                }}
              >
                {fleetSummary.averageAvailability || 0}%
              </div>
              <span className="muted" style={{ fontSize: 11 }}>DGMS Statutory Norm: ≥ 80%</span>
            </div>

            <div className="metric-box">
              <div className="label">Fleet Utilization (OU)</div>
              <div className="num" style={{ color: "var(--accent)" }}>
                {fleetSummary.averageUtilization || 0}%
              </div>
              <span className="muted" style={{ fontSize: 11 }}>DGMS Statutory Norm: ≥ 65%</span>
            </div>

            <div className="metric-box">
              <div className="label">Use of Availability (UA)</div>
              <div className="num" style={{ color: "#8b5cf6" }}>
                {fleetSummary.averageUseOfAvailability || 0}%
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Operating / (Scheduled - Maint)</span>
            </div>

            <div className="metric-box">
              <div className="label">Total Operating Hours</div>
              <div className="num">
                {Number(fleetSummary.operatingHours || 0).toLocaleString()} <span style={{ fontSize: 13 }}>h</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>
                Maint: {Number(fleetSummary.maintenanceHours || 0).toLocaleString()}h • Idle: {Number(fleetSummary.idleHours || 0).toLocaleString()}h
              </span>
            </div>
          </div>

          {/* Availability vs Utilization Comparison Chart */}
          <div className="chart-card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 4px" }}>Mechanical Availability vs Operating Utilization</h3>
            <span className="muted" style={{ fontSize: 12 }}>
              High availability paired with low utilization indicates operational queuing or idle delays
            </span>
            <div style={{ height: 320, marginTop: 14 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={equipmentList} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="equipmentId" />
                  <YAxis unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(v) => [`${v}%`]} />
                  <Legend />
                  <Bar dataKey="mechanicalAvailability" fill="#10b981" name="Mechanical Availability (MA %)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="utilization" fill="#3b82f6" name="Operating Utilization (OU %)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Time Conservation Breakdown: Operating + Idle + Maintenance */}
          <div className="chart-card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 4px" }}>Shift Hour Reconciliation Breakdown (Ts = To + Ti + Tm)</h3>
            <span className="muted" style={{ fontSize: 12 }}>
              Distribution of scheduled shift time across Operating Work, Idle Delays, and Maintenance Downtime
            </span>
            <div style={{ height: 300, marginTop: 14 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="equipmentId" />
                  <YAxis unit=" h" />
                  <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} hrs`]} />
                  <Legend />
                  <Bar dataKey="operatingHours" stackId="hours" fill="#10b981" name="Operating Hours (To)" />
                  <Bar dataKey="idleHours" stackId="hours" fill="#f59e0b" name="Idle / Delay Hours (Ti)" />
                  <Bar dataKey="maintenanceHours" stackId="hours" fill="#ef4444" name="Maintenance Downtime (Tm)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fleet Comparison Master Table */}
          <section className="surface-card data-page-card">
            <div className="section-head">
              <div>
                <h3 style={{ margin: 0 }}>Equipment Fleet Operational Master Table</h3>
                <span className="chart-meta">Sorted by asset tag with availability, utilization and productivity metrics</span>
              </div>
              <div className="table-badge">{equipmentList.length} units listed</div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>Fleet Type</th>
                    <th className="num-col">Operating (h)</th>
                    <th className="num-col">Idle (h)</th>
                    <th className="num-col">Downtime (h)</th>
                    <th className="num-col">Availability %</th>
                    <th className="num-col">Utilization %</th>
                    <th className="num-col">Use of Avail %</th>
                    <th className="num-col">Productivity</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.map((row) => (
                    <tr key={row.equipmentId}>
                      <td style={{ fontWeight: 600 }}>{row.equipmentId}</td>
                      <td>
                        <span className="pill pill-soft">{row.equipmentType}</span>
                      </td>
                      <td className="num-col">{Number(row.operatingHours).toFixed(1)}</td>
                      <td className="num-col">{Number(row.idleHours).toFixed(1)}</td>
                      <td className="num-col">{Number(row.downtimeHours).toFixed(1)}</td>
                      <td className="num-col">
                        <span
                          className={`badge ${
                            Number(row.mechanicalAvailability) >= 80 ? "badge-success" : "badge-danger"
                          }`}
                        >
                          {Number(row.mechanicalAvailability).toFixed(1)}%
                        </span>
                      </td>
                      <td className="num-col">
                        <span className="util-chip">{Number(row.utilization).toFixed(1)}%</span>
                      </td>
                      <td className="num-col">{Number(row.useOfAvailability).toFixed(1)}%</td>
                      <td className="num-col">
                        {row.productivityTonPerHour > 0 ? (
                          <span style={{ fontWeight: 600 }}>{row.productivityTonPerHour} t/h</span>
                        ) : (
                          <span className="muted">—</span>
                        )}
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

export default EquipmentView;
