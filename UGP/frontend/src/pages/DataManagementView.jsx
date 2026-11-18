import { useEffect, useState } from "react";
import FiltersBar from "../components/Filters/FiltersBar.jsx";
import { useFilters } from "../context/FilterContext.jsx";
import { exportToCsv } from "../utils/exportCsv.js";
import {
  getRawRecords,
  getEquipment,
  getMaterials,
  getBenchmarks,
} from "../services/api.js";

const DataManagementView = () => {
  const { filters, registerExportHandler } = useFilters();
  const [activeTab, setActiveTab] = useState("records");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rawRecordsData, setRawRecordsData] = useState({ total: 0, page: 1, limit: 100, records: [] });
  const [equipmentList, setEquipmentList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [benchmarksList, setBenchmarksList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Load active tab data
  useEffect(() => {
    let isMounted = true;
    const loadTabData = async () => {
      setLoading(true);
      setError("");
      try {
        if (activeTab === "records") {
          const data = await getRawRecords({ ...filters, page: currentPage, limit: 50 });
          if (isMounted) setRawRecordsData(data || { total: 0, page: 1, limit: 50, records: [] });
        } else if (activeTab === "equipment") {
          const data = await getEquipment();
          if (isMounted) setEquipmentList(data || []);
        } else if (activeTab === "materials") {
          const data = await getMaterials();
          if (isMounted) setMaterialsList(data || []);
        } else if (activeTab === "benchmarks") {
          const data = await getBenchmarks();
          if (isMounted) setBenchmarksList(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load management records.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTabData();
    return () => {
      isMounted = false;
    };
  }, [activeTab, filters, currentPage]);

  // Register CSV Export depending on active tab
  useEffect(() => {
    registerExportHandler(() => {
      if (activeTab === "records") {
        exportToCsv(rawRecordsData.records, `operational_shift_records_${filters.startDate}_to_${filters.endDate}.csv`, {
          date: "Date",
          shiftCode: "Shift",
          equipmentId: "Asset Tag",
          equipmentType: "Type",
          materialCategory: "Category",
          materialTonnage: "Tonnage (t)",
          trips: "Trips",
          operatingHours: "Operating (h)",
          idleHours: "Idle (h)",
          maintenanceHours: "Downtime (h)",
          primaryDowntimeReason: "Primary Delay / Maintenance",
          fuelLiters: "Fuel (L)",
          operatingCost: "Operating Cost (₹)",
        });
      } else if (activeTab === "equipment") {
        exportToCsv(equipmentList, "hemm_fleet_roster.csv", {
          equipmentId: "Asset Tag",
          type: "Category",
          makeModel: "Make & Model",
          capacityTon: "Rated Capacity (t)",
          bucketCapacityM3: "Bucket Volume (m³)",
          ratedPowerHp: "Engine Power (HP)",
          status: "Status",
          notes: "Assignment Notes",
        });
      } else if (activeTab === "materials") {
        exportToCsv(materialsList, "materials_master.csv", {
          materialId: "Code",
          name: "Material Name",
          category: "Category",
          densityInSitu: "In-Situ Density (t/m³)",
          swellFactor: "Swell Factor",
          defaultUnit: "Unit",
        });
      } else if (activeTab === "benchmarks") {
        exportToCsv(benchmarksList, "public_mining_benchmarks.csv", {
          organization: "Organization",
          mineName: "Reference Concession",
          mineral: "Mineral",
          productionTonnage: "Reported Production (t)",
          overburdenVolumeBcm: "Reported OB (BCM)",
          strippingRatio: "Stripping Ratio (m³/t)",
          averageAvailabilityPercent: "Availability Norm %",
          averageUtilizationPercent: "Utilization Norm %",
          sourceUrl: "Reference URL",
        });
      }
    });
  }, [activeTab, rawRecordsData, equipmentList, materialsList, benchmarksList, filters, registerExportHandler]);

  return (
    <div className="dashboard-page">
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Equipment & Data Management Explorer</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              Operational fact logs, HEMM fleet roster, geological strata catalog, and official public mining benchmarks
            </span>
          </div>
          <span className="badge badge-info">Multi-Entity Management</span>
        </div>

        {activeTab === "records" && <FiltersBar customExportLabel="Export Shift Records CSV" />}
      </section>

      {/* Subnav Tabs */}
      <div className="subnav-bar">
        <button
          type="button"
          className={`subnav-btn ${activeTab === "records" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("records");
            setCurrentPage(1);
          }}
        >
          📋 Raw Shift Records
        </button>
        <button
          type="button"
          className={`subnav-btn ${activeTab === "equipment" ? "active" : ""}`}
          onClick={() => setActiveTab("equipment")}
        >
          🚜 16-Unit HEMM Fleet Roster
        </button>
        <button
          type="button"
          className={`subnav-btn ${activeTab === "materials" ? "active" : ""}`}
          onClick={() => setActiveTab("materials")}
        >
          ⛏️ Material Strata Catalog
        </button>
        <button
          type="button"
          className={`subnav-btn ${activeTab === "benchmarks" ? "active" : ""}`}
          onClick={() => setActiveTab("benchmarks")}
        >
          🏛️ Public Mining Benchmarks (CIL / IBM / DGMS)
        </button>
      </div>

      {loading && <p className="status-text info">Loading table data...</p>}
      {error && <p className="status-text error">{error}</p>}

      {/* Tab 1: Raw Shift Fact Records */}
      {!loading && !error && activeTab === "records" && (
        <section className="surface-card data-page-card">
          <div className="section-head">
            <div>
              <h3 style={{ margin: 0 }}>Operational Shift Fact Records</h3>
              <span className="chart-meta">
                Showing page {rawRecordsData.page} of {rawRecordsData.totalPages || 1} (Total: {rawRecordsData.total} logs)
              </span>
            </div>
            <div className="table-badge">{rawRecordsData.records.length} records shown</div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Asset Tag</th>
                  <th>Type</th>
                  <th>Material</th>
                  <th className="num-col">Tonnage</th>
                  <th className="num-col">Trips</th>
                  <th className="num-col">Op (h)</th>
                  <th className="num-col">Idle (h)</th>
                  <th className="num-col">Maint (h)</th>
                  <th>Primary Delay / Maintenance</th>
                  <th className="num-col">Fuel (L)</th>
                  <th className="num-col">Cost (₹)</th>
                </tr>
              </thead>
              <tbody>
                {rawRecordsData.records.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toISOString().slice(0, 10)}</td>
                    <td>
                      <span className="pill pill-neutral">{r.shiftCode}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.equipmentId}</td>
                    <td>
                      <span className="pill pill-soft">{r.equipmentType}</span>
                    </td>
                    <td>
                      <span className={`badge ${r.materialCategory === "Mineral" ? "badge-success" : "badge-info"}`}>
                        {r.materialCategory}
                      </span>
                    </td>
                    <td className="num-col">{Number(r.materialTonnage).toLocaleString()} t</td>
                    <td className="num-col">{r.trips}</td>
                    <td className="num-col">{Number(r.operatingHours).toFixed(1)}</td>
                    <td className="num-col">{Number(r.idleHours).toFixed(1)}</td>
                    <td className="num-col" style={{ color: r.maintenanceHours > 0 ? "var(--danger)" : "inherit" }}>
                      {Number(r.maintenanceHours).toFixed(1)}
                    </td>
                    <td>
                      <span className="reason-badge">{r.primaryDowntimeReason || r.downtimeReason || "None"}</span>
                    </td>
                    <td className="num-col">{Number(r.fuelLiters || 0).toFixed(0)}</td>
                    <td className="num-col">₹{Number(r.operatingCost || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination-bar">
            <div className="muted" style={{ fontSize: 13 }}>
              Total {rawRecordsData.total} logs recorded in database
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="icon-btn text-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ◀ Previous
              </button>
              <span style={{ alignSelf: "center", fontSize: 13, fontWeight: 600 }}>
                Page {rawRecordsData.page} of {rawRecordsData.totalPages || 1}
              </span>
              <button
                type="button"
                className="icon-btn text-btn"
                disabled={currentPage >= (rawRecordsData.totalPages || 1)}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next ▶
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: 16-Unit HEMM Fleet Roster */}
      {!loading && !error && activeTab === "equipment" && (
        <section className="surface-card data-page-card">
          <div className="section-head">
            <div>
              <h3 style={{ margin: 0 }}>16-Unit Heavy Earth Moving Machinery (HEMM) Fleet Roster</h3>
              <span className="chart-meta">
                Technical specifications, engine ratings, and operating assignments
              </span>
            </div>
            <div className="table-badge">{equipmentList.length} units registered</div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Fleet Category</th>
                  <th>Make & Commercial Model</th>
                  <th className="num-col">Payload / Weight</th>
                  <th className="num-col">Bucket Volume</th>
                  <th className="num-col">Engine Power</th>
                  <th>Operational Status</th>
                  <th>Primary Assignment</th>
                </tr>
              </thead>
              <tbody>
                {equipmentList.map((eq) => (
                  <tr key={eq.equipmentId}>
                    <td style={{ fontWeight: 700 }}>{eq.equipmentId}</td>
                    <td>
                      <span className="pill pill-soft">{eq.type}</span>
                    </td>
                    <td>{eq.makeModel}</td>
                    <td className="num-col">{eq.capacityTon} tonnes</td>
                    <td className="num-col">{eq.bucketCapacityM3 > 0 ? `${eq.bucketCapacityM3} m³` : "—"}</td>
                    <td className="num-col">{eq.ratedPowerHp > 0 ? `${eq.ratedPowerHp} HP` : "—"}</td>
                    <td>
                      <span className="badge badge-success">{eq.status}</span>
                    </td>
                    <td style={{ fontSize: 13 }}>{eq.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 3: Geological Strata Catalog */}
      {!loading && !error && activeTab === "materials" && (
        <section className="surface-card data-page-card">
          <div className="section-head">
            <div>
              <h3 style={{ margin: 0 }}>Geological Materials & Strata Master</h3>
              <span className="chart-meta">In-situ bulk densities and volumetric swell expansion ratios</span>
            </div>
            <div className="table-badge">{materialsList.length} materials configured</div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material Code</th>
                  <th>Strata Description</th>
                  <th>Category</th>
                  <th className="num-col">In-Situ Density (ρ)</th>
                  <th className="num-col">Swell Factor (SF)</th>
                  <th>Default Unit</th>
                </tr>
              </thead>
              <tbody>
                {materialsList.map((m) => (
                  <tr key={m.materialId}>
                    <td style={{ fontWeight: 600 }}>{m.materialId}</td>
                    <td>{m.name}</td>
                    <td>
                      <span className={`badge ${m.category === "Mineral" ? "badge-success" : "badge-info"}`}>
                        {m.category}
                      </span>
                    </td>
                    <td className="num-col">{m.densityInSitu} t/m³</td>
                    <td className="num-col">{m.swellFactor}</td>
                    <td>{m.defaultUnit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 4: Official Public Benchmarks */}
      {!loading && !error && activeTab === "benchmarks" && (
        <section className="surface-card data-page-card">
          <div className="section-head">
            <div>
              <h3 style={{ margin: 0 }}>Authentic Indian Public Sector Mining Benchmarks</h3>
              <span className="chart-meta">
                Verified reference statistics from Coal India Limited (CIL), Indian Bureau of Mines (IBM), and DGMS circulars
              </span>
            </div>
            <div className="table-badge">Official Public Reference</div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Public Enterprise</th>
                  <th>Reference Concession</th>
                  <th>Mineral</th>
                  <th className="num-col">Annual Production (t)</th>
                  <th className="num-col">Overburden (BCM)</th>
                  <th className="num-col">Stripping Ratio</th>
                  <th className="num-col">Availability Norm</th>
                  <th className="num-col">Utilization Norm</th>
                  <th>Official Citation</th>
                </tr>
              </thead>
              <tbody>
                {benchmarksList.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 600 }}>{b.organization}</td>
                    <td>{b.mineName}</td>
                    <td>{b.mineral}</td>
                    <td className="num-col">
                      {b.productionTonnage > 0 ? `${(b.productionTonnage / 1000000).toFixed(1)} MT` : "Norm"}
                    </td>
                    <td className="num-col">
                      {b.overburdenVolumeBcm > 0 ? `${(b.overburdenVolumeBcm / 1000000).toFixed(1)} M BCM` : "—"}
                    </td>
                    <td className="num-col">{b.strippingRatio > 0 ? `${b.strippingRatio} m³/t` : "—"}</td>
                    <td className="num-col">
                      <span className="badge badge-success">{b.averageAvailabilityPercent}%</span>
                    </td>
                    <td className="num-col">
                      <span className="util-chip">{b.averageUtilizationPercent}%</span>
                    </td>
                    <td>
                      <a
                        href={b.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--accent)", textDecoration: "none", fontSize: 12 }}
                      >
                        Source Link ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default DataManagementView;

