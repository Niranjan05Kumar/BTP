import { useEffect, useState } from "react";
import FiltersBar from "../components/Filters/FiltersBar.jsx";
import { useFilters } from "../context/FilterContext.jsx";
import { exportToCsv } from "../utils/exportCsv.js";
import { getFleetMatching } from "../services/api.js";

const FleetMatchingView = () => {
  const { filters, registerExportHandler } = useFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchingData, setMatchingData] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadMatching = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getFleetMatching(filters);
        if (isMounted) {
          setMatchingData(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load shovel-dumper matching analytics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMatching();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Register CSV Export
  useEffect(() => {
    registerExportHandler(() => {
      exportToCsv(matchingData, `shovel_dumper_matching_${filters.startDate}_to_${filters.endDate}.csv`, {
        shovelId: "Excavator ID",
        shovelModel: "Machine Model",
        bucketCapacityM3: "Bucket Volume (m³)",
        activeDumpersCount: "Assigned Dumpers (Nd)",
        avgLoadingTimeMinutes: "Shovel Loading Time (tl min)",
        avgCycleTimeMinutes: "Dumper Cycle Time (Tc min)",
        avgQueueWaitMinutes: "Queue Wait (min)",
        matchFactor: "Match Factor (MF)",
        status: "Fleet Synchronization Status",
        estimatedPasses: "Pass Count (Np)",
        recommendation: "Operational Recommendation",
      });
    });
  }, [matchingData, filters, registerExportHandler]);

  return (
    <div className="dashboard-page">
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Shovel–Dumper Fleet Matching Analysis</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              Kinematic balance factor MF = (Nd × tl) / (Ns × Tc), loading pass counts, and queue congestion diagnostics
            </span>
          </div>
          <span className="badge badge-info">SME Mining Dispatch Synchronization</span>
        </div>
        <FiltersBar customExportLabel="Export Matching CSV" showMaterial={false} />
      </section>

      {loading && <p className="status-text info">Loading shovel-dumper matching calculations...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && matchingData.length === 0 && (
        <p className="status-text muted">No matching records available for current filter selection.</p>
      )}

      {!loading && !error && matchingData.length > 0 && (
        <>
          {/* Match Factor Diagnostic Reference Cards */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {matchingData.map((crew) => (
              <div
                key={crew.shovelId}
                className="chart-card"
                style={{
                  padding: 20,
                  borderTop: `4px solid ${
                    crew.status === "Balanced"
                      ? "var(--success)"
                      : crew.status === "Under-Trucked"
                      ? "var(--warning)"
                      : "var(--danger)"
                  }`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: "0 0 2px" }}>{crew.shovelId} Crew</h3>
                    <span className="muted" style={{ fontSize: 12 }}>{crew.shovelModel}</span>
                  </div>
                  <span
                    className={`badge ${
                      crew.status === "Balanced"
                        ? "badge-success"
                        : crew.status === "Under-Trucked"
                        ? "badge-warning"
                        : "badge-danger"
                    }`}
                  >
                    {crew.status}
                  </span>
                </div>

                <div style={{ margin: "16px 0", display: "flex", alignItems: "baseline", gap: 10 }}>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>{crew.matchFactor}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Match Factor (MF)
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 16 }}>
                  <div>
                    <span className="muted">Bucket Volume:</span>{" "}
                    <strong>{crew.bucketCapacityM3} m³</strong>
                  </div>
                  <div>
                    <span className="muted">Assigned Trucks:</span>{" "}
                    <strong>{crew.activeDumpersCount} units</strong>
                  </div>
                  <div>
                    <span className="muted">Loading Time:</span>{" "}
                    <strong>{crew.avgLoadingTimeMinutes} min</strong>
                  </div>
                  <div>
                    <span className="muted">Truck Cycle Time:</span>{" "}
                    <strong>{crew.avgCycleTimeMinutes} min</strong>
                  </div>
                  <div>
                    <span className="muted">Queue Wait:</span>{" "}
                    <strong>{crew.avgQueueWaitMinutes} min</strong>
                  </div>
                  <div>
                    <span className="muted">Estimated Passes:</span>{" "}
                    <strong>{crew.estimatedPasses} passes</strong>
                  </div>
                </div>

                <div
                  style={{
                    background: "color-mix(in srgb, var(--card) 92%, var(--text-primary))",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: "var(--accent)" }}>Action:</strong> {crew.recommendation}
                </div>
              </div>
            ))}
          </div>

          {/* Theoretical Diagnostic Rules Table */}
          <section className="surface-card data-page-card">
            <div className="section-head">
              <div>
                <h3 style={{ margin: 0 }}>Fleet Matching & Dispatch Evaluation Matrix</h3>
                <span className="chart-meta">
                  Derived from dumper cycle records and excavator bucket capacities
                </span>
              </div>
              <div className="table-badge">{matchingData.length} active excavation benches</div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Excavator Tag</th>
                    <th>Bucket (m³)</th>
                    <th className="num-col">Assigned Trucks (Nd)</th>
                    <th className="num-col">Loading Time (tl)</th>
                    <th className="num-col">Cycle Time (Tc)</th>
                    <th className="num-col">Queue Wait (tw)</th>
                    <th className="num-col">Match Factor (MF)</th>
                    <th>Fleet Status</th>
                    <th className="num-col">Estimated Passes</th>
                    <th>Assigned Haul Truck Fleet</th>
                  </tr>
                </thead>
                <tbody>
                  {matchingData.map((row) => (
                    <tr key={row.shovelId}>
                      <td style={{ fontWeight: 600 }}>{row.shovelId}</td>
                      <td>{row.bucketCapacityM3} m³</td>
                      <td className="num-col">{row.activeDumpersCount}</td>
                      <td className="num-col">{row.avgLoadingTimeMinutes} min</td>
                      <td className="num-col">{row.avgCycleTimeMinutes} min</td>
                      <td className="num-col">{row.avgQueueWaitMinutes} min</td>
                      <td className="num-col" style={{ fontWeight: 800 }}>
                        {row.matchFactor}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            row.status === "Balanced"
                              ? "badge-success"
                              : row.status === "Under-Trucked"
                              ? "badge-warning"
                              : "badge-danger"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="num-col">{row.estimatedPasses} passes</td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {(row.activeDumperList || []).map((d) => (
                            <span key={d} className="pill pill-neutral" style={{ fontSize: 11, padding: "0 6px" }}>
                              {d}
                            </span>
                          ))}
                        </div>
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

export default FleetMatchingView;

