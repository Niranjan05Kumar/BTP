import { useEffect, useState } from "react";
import FiltersBar from "../components/Filters/FiltersBar.jsx";
import { useFilters } from "../context/FilterContext.jsx";
import { exportToCsv } from "../utils/exportCsv.js";
import { getInsights } from "../services/api.js";

const InsightsView = () => {
  const { filters, registerExportHandler } = useFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [insightsData, setInsightsData] = useState({ summary: {}, insights: [] });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let isMounted = true;
    const loadInsights = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getInsights(filters);
        if (isMounted) {
          setInsightsData(data || { summary: {}, insights: [] });
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load operational bottleneck insights.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInsights();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const allInsights = insightsData.insights || [];
  const filteredInsights = activeTab === "all" ? allInsights : allInsights.filter((i) => i.severity === activeTab);

  // Register CSV Export
  useEffect(() => {
    registerExportHandler(() => {
      exportToCsv(allInsights, `operational_bottlenecks_${filters.startDate}_to_${filters.endDate}.csv`, {
        id: "Rule Code",
        category: "Operational Category",
        severity: "Severity Level",
        title: "Diagnostic Title",
        metric: "Observed Metric",
        finding: "Detailed Engineering Finding",
        recommendation: "Operational Recommendation",
      });
    });
  }, [allInsights, filters, registerExportHandler]);

  return (
    <div className="dashboard-page">
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Operational Insights & Bottleneck Detection</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              Explainable, rule-based diagnostic rules evaluating haulage queuing, availability deficits, and shovel-dumper sync
            </span>
          </div>
          <span className="badge badge-info">Rule-Based Heuristic Evaluation</span>
        </div>
        <FiltersBar customExportLabel="Export Insights CSV" />
      </section>

      {loading && <p className="status-text info">Evaluating operational diagnostics...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Summary Metric Ribbon */}
          <div className="grid-4">
            <div className="metric-box">
              <div className="label">Total Detected Findings</div>
              <div className="num" style={{ color: "var(--accent)" }}>
                {insightsData.summary?.totalInsights || 0}
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Traceable to quantitative metrics</span>
            </div>

            <div className="metric-box">
              <div className="label">Critical Bottlenecks</div>
              <div className="num" style={{ color: "var(--danger)" }}>
                {insightsData.summary?.criticalCount || 0}
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Requires immediate dispatch intervention</span>
            </div>

            <div className="metric-box">
              <div className="label">Operational Warnings</div>
              <div className="num" style={{ color: "var(--warning)" }}>
                {insightsData.summary?.warningCount || 0}
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Precautionary performance advisories</span>
            </div>

            <div className="metric-box">
              <div className="label">Optimal Conditions</div>
              <div className="num" style={{ color: "var(--success)" }}>
                {insightsData.summary?.positiveCount || 0}
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Areas exceeding target thresholds</span>
            </div>
          </div>

          {/* Severity Tabs */}
          <div className="subnav-bar">
            <button
              type="button"
              className={`subnav-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Findings ({allInsights.length})
            </button>
            <button
              type="button"
              className={`subnav-btn ${activeTab === "critical" ? "active" : ""}`}
              onClick={() => setActiveTab("critical")}
            >
              Critical ({insightsData.summary?.criticalCount || 0})
            </button>
            <button
              type="button"
              className={`subnav-btn ${activeTab === "warning" ? "active" : ""}`}
              onClick={() => setActiveTab("warning")}
            >
              Warnings ({insightsData.summary?.warningCount || 0})
            </button>
            <button
              type="button"
              className={`subnav-btn ${activeTab === "positive" ? "active" : ""}`}
              onClick={() => setActiveTab("positive")}
            >
              Optimal ({insightsData.summary?.positiveCount || 0})
            </button>
          </div>

          {/* Insight Cards Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredInsights.map((item) => (
              <div
                key={item.id}
                className="chart-card"
                style={{
                  padding: 20,
                  borderLeft: `5px solid ${
                    item.severity === "critical"
                      ? "var(--danger)"
                      : item.severity === "warning"
                      ? "var(--warning)"
                      : "var(--success)"
                  }`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className="badge badge-info">{item.category}</span>
                      <span
                        className={`badge ${
                          item.severity === "critical"
                            ? "badge-danger"
                            : item.severity === "warning"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <h3 style={{ margin: "4px 0" }}>{item.title}</h3>
                  </div>

                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "color-mix(in srgb, var(--card) 90%, var(--text-primary))",
                    }}
                  >
                    {item.metric}
                  </span>
                </div>

                <p style={{ margin: "12px 0 16px", color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>
                  {item.finding}
                </p>

                <div
                  style={{
                    background: "color-mix(in srgb, var(--accent) 8%, var(--card))",
                    border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  <strong style={{ color: "var(--accent)" }}>Recommended Engineering Action:</strong>{" "}
                  {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InsightsView;

