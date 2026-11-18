import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
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
import { getStrippingRatio, getMaterials } from "../services/api.js";

const MaterialStrippingView = () => {
  const { filters, registerExportHandler } = useFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [strippingData, setStrippingData] = useState({});
  const [materialsMaster, setMaterialsMaster] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [sr, mats] = await Promise.all([
          getStrippingRatio(filters),
          getMaterials(),
        ]);
        if (isMounted) {
          setStrippingData(sr || {});
          setMaterialsMaster(mats || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load material & stripping analytics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Register CSV Export
  useEffect(() => {
    registerExportHandler(() => {
      const trend = strippingData.trend || [];
      exportToCsv(trend, `stripping_ratio_trend_${filters.startDate}_to_${filters.endDate}.csv`, {
        date: "Date",
        mineralTonnage: "Coal/Ore Extracted (t)",
        overburdenTonnage: "Overburden Mass (t)",
        overburdenBcm: "Overburden Volume (BCM)",
        volumetricStrippingRatio: "Volumetric SR (m³/t)",
      });
    });
  }, [strippingData, filters, registerExportHandler]);

  return (
    <div className="dashboard-page">
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Material Stratum & Stripping-Ratio Analysis</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              Volumetric Stripping Ratio (SRv in m³/t), Gravimetric Ratio (SRm in t/t), and physical rock properties
            </span>
          </div>
          <span className="badge badge-info">Bank Cubic Meter (BCM) Rock Mechanics</span>
        </div>
        <FiltersBar customExportLabel="Export Stripping CSV" />
      </section>

      {loading && <p className="status-text info">Loading material & stripping metrics...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Key Stripping Ratios Ribbon */}
          <div className="grid-4">
            <div className="metric-box">
              <div className="label">Volumetric Stripping Ratio (SRv)</div>
              <div className="num" style={{ color: "var(--accent)" }}>
                {strippingData.volumetricStrippingRatio || 0}{" "}
                <span style={{ fontSize: 13 }}>m³/t</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>BCM Overburden removed per Tonne Coal</span>
            </div>

            <div className="metric-box">
              <div className="label">Gravimetric Stripping Ratio (SRm)</div>
              <div className="num" style={{ color: "#8b5cf6" }}>
                {strippingData.gravimetricStrippingRatio || 0}{" "}
                <span style={{ fontSize: 13 }}>t/t</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Mass Overburden per Mass Coal extracted</span>
            </div>

            <div className="metric-box">
              <div className="label">Overburden Volume Removed</div>
              <div className="num" style={{ color: "var(--warning)" }}>
                {Number(strippingData.overburdenVolumeBcm || 0).toLocaleString()}{" "}
                <span style={{ fontSize: 13 }}>BCM</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>
                Total OB mass: {Number(strippingData.overburdenTonnage || 0).toLocaleString()} t
              </span>
            </div>

            <div className="metric-box">
              <div className="label">Clean Coal / Ore Extracted</div>
              <div className="num" style={{ color: "var(--success)" }}>
                {Number(strippingData.mineralTonnage || 0).toLocaleString()}{" "}
                <span style={{ fontSize: 13 }}>t</span>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Run-of-mine marketable commodity</span>
            </div>
          </div>

          {/* Daily Stripping Ratio Progression Chart */}
          <div className="chart-card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 4px" }}>Daily Volumetric Stripping Ratio Trend (SRv m³/t)</h3>
            <span className="muted" style={{ fontSize: 12 }}>
              Daily ratio of overburden volume stripped to coal recovered
            </span>
            <div style={{ height: 320, marginTop: 14 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={strippingData.trend || []} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis unit=" m³/t" />
                  <Tooltip formatter={(v) => [`${v} m³/t`]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="volumetricStrippingRatio"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    name="Volumetric Stripping Ratio (m³/t)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mineral vs Overburden Dual Progression */}
          <div className="chart-card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 4px" }}>Coal Extraction vs Overburden Removal Progression</h3>
            <span className="muted" style={{ fontSize: 12 }}>Daily comparison in metric tonnes</span>
            <div style={{ height: 280, marginTop: 14 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={strippingData.trend || []} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="obGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="coalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis unit=" t" />
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} t`]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="overburdenTonnage"
                    stroke="#8b5cf6"
                    fill="url(#obGrad)"
                    name="Overburden Mass (t)"
                  />
                  <Area
                    type="monotone"
                    dataKey="mineralTonnage"
                    stroke="#10b981"
                    fill="url(#coalGrad)"
                    name="Coal Extracted (t)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Material Master Rock Properties Table */}
          <section className="surface-card data-page-card">
            <div className="section-head">
              <div>
                <h3 style={{ margin: 0 }}>Material Rock Mechanics Catalog</h3>
                <span className="chart-meta">In-situ bulk densities (t/m³) and volumetric swell expansion factors</span>
              </div>
              <div className="table-badge">{materialsMaster.length} geological strata</div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Material Code</th>
                    <th>Descriptive Name</th>
                    <th>Classification</th>
                    <th className="num-col">In-Situ Density (ρ)</th>
                    <th className="num-col">Swell Factor (SF)</th>
                    <th>Default Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {materialsMaster.map((mat) => (
                    <tr key={mat.materialId}>
                      <td style={{ fontWeight: 600 }}>{mat.materialId}</td>
                      <td>{mat.name}</td>
                      <td>
                        <span className={`badge ${mat.category === "Mineral" ? "badge-success" : "badge-info"}`}>
                          {mat.category}
                        </span>
                      </td>
                      <td className="num-col">{mat.densityInSitu} t/m³</td>
                      <td className="num-col">{mat.swellFactor}</td>
                      <td>{mat.defaultUnit}</td>
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

export default MaterialStrippingView;

