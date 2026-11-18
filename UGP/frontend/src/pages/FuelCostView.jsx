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
import { getFuelCostSummary } from "../services/api.js";

const FuelCostView = () => {
  const { filters, registerExportHandler } = useFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fuelData, setFuelData] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadFuel = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getFuelCostSummary(filters);
        if (isMounted) {
          setFuelData(data || {});
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load fuel & operating cost analytics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFuel();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Register CSV Export
  useEffect(() => {
    registerExportHandler(() => {
      const breakdown = fuelData.equipmentBreakdown || [];
      exportToCsv(breakdown, `equipment_fuel_and_cost_${filters.startDate}_to_${filters.endDate}.csv`, {
        equipmentId: "Asset Tag",
        equipmentType: "HEMM Type",
        operatingHours: "Operating Hours (h)",
        fuelLiters: "Fuel Consumed (L)",
        litersPerHour: "Fuel Burn (L/h)",
        litersPerTonne: "Fuel Intensity (L/t)",
        operatingCost: "Total Operating Cost (₹)",
        costPerTonne: "Specific Cost (₹/t)",
      });
    });
  }, [fuelData, filters, registerExportHandler]);

  const breakdown = fuelData.equipmentBreakdown || [];

  return (
    <div className="dashboard-page">
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Fuel Consumption & Operating Cost Analysis</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              Specific diesel consumption (L/h, L/t), HEMM operating costs, and unit costs per extracted tonne
            </span>
          </div>
          <span className="badge badge-info">Diesel & HEMM Lifecycle Economics</span>
        </div>
        <FiltersBar customExportLabel="Export Fuel/Cost CSV" showMaterial={false} />
      </section>

      {loading && <p className="status-text info">Loading fuel and operating cost data...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && breakdown.length === 0 && (
        <p className="status-text muted">No fuel consumption records found for selected filter parameters.</p>
      )}

      {!loading && !error && breakdown.length > 0 && (
        <>
          {/* Key Fuel & Cost Metrics Ribbon */}
          <div className="grid-4">
            <div className="metric-box">
              <div className="label">Total Diesel Consumed</div>
              <div className="num" style={{ color: "var(--accent)" }}>
                {Number(fuelData.totalFuelLiters || 0).toLocaleString()}{" "}
                <span style={{ fontSize: 13 }}>L</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>
                Operating hours: {Number(fuelData.totalOperatingHours || 0).toLocaleString()} h
              </span>
            </div>

            <div className="metric-box">
              <div className="label">Fleet Average Burn Rate</div>
              <div className="num" style={{ color: "#f59e0b" }}>
                {fuelData.averageLitersPerHour || 0}{" "}
                <span style={{ fontSize: 13 }}>L/hr</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Liters consumed per working engine hour</span>
            </div>

            <div className="metric-box">
              <div className="label">Specific Fuel Intensity</div>
              <div className="num" style={{ color: "#ec4899" }}>
                {fuelData.averageLitersPerTonne || 0}{" "}
                <span style={{ fontSize: 13 }}>L/t</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Diesel volume per extracted metric tonne</span>
            </div>

            <div className="metric-box">
              <div className="label">Specific Operating Cost</div>
              <div className="num" style={{ color: "var(--success)" }}>
                ₹{fuelData.averageCostPerTonne || 0}{" "}
                <span style={{ fontSize: 13 }}>/t</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>
                Total: ₹{Number(fuelData.totalOperatingCost || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Equipment-Wise Fuel Burn Rate Chart */}
          <div className="chart-card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 4px" }}>Equipment Fuel Consumption per Working Hour (L/h)</h3>
            <span className="muted" style={{ fontSize: 12 }}>
              Specific hourly diesel burn across mobile fleet
            </span>
            <div style={{ height: 320, marginTop: 14 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="equipmentId" />
                  <YAxis unit=" L/h" />
                  <Tooltip formatter={(v) => [`${v} L/hr`]} />
                  <Legend />
                  <Bar dataKey="litersPerHour" fill="#ec4899" name="Fuel Burn Rate (L/hr)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Equipment Cost Comparison Table */}
          <section className="surface-card data-page-card">
            <div className="section-head">
              <div>
                <h3 style={{ margin: 0 }}>Equipment Fleet Fuel & Operating Cost Ledger</h3>
                <span className="chart-meta">Operating hours, diesel consumption, unit costs, and specific fuel intensity</span>
              </div>
              <div className="table-badge">{breakdown.length} units evaluated</div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>HEMM Type</th>
                    <th className="num-col">Operating (h)</th>
                    <th className="num-col">Fuel Consumed (L)</th>
                    <th className="num-col">Burn Rate (L/h)</th>
                    <th className="num-col">Intensity (L/t)</th>
                    <th className="num-col">Total Operating Cost</th>
                    <th className="num-col">Cost / Tonne</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((eq) => (
                    <tr key={eq.equipmentId}>
                      <td style={{ fontWeight: 600 }}>{eq.equipmentId}</td>
                      <td>
                        <span className="pill pill-soft">{eq.equipmentType}</span>
                      </td>
                      <td className="num-col">{Number(eq.operatingHours).toFixed(1)} h</td>
                      <td className="num-col">{Number(eq.fuelLiters).toLocaleString()} L</td>
                      <td className="num-col">{Number(eq.litersPerHour).toFixed(1)} L/h</td>
                      <td className="num-col">
                        {eq.litersPerTonne > 0 ? `${Number(eq.litersPerTonne).toFixed(3)} L/t` : "—"}
                      </td>
                      <td className="num-col">₹{Number(eq.operatingCost).toLocaleString()}</td>
                      <td className="num-col">
                        {eq.costPerTonne > 0 ? (
                          <span style={{ fontWeight: 700 }}>₹{Number(eq.costPerTonne).toFixed(2)}/t</span>
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

export default FuelCostView;

