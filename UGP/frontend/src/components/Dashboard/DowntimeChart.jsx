import { useState, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Distinct, modern palette for top reasons
const PALETTE = [
  "#ef4444", // Red - Breakdown / Critical
  "#f97316", // Orange - High Delay
  "#f59e0b", // Amber - Moderate Delay
  "#3b82f6", // Blue - PM Service
  "#8b5cf6", // Purple - Electrical / Aux
  "#64748b", // Slate - Other Aggregated Delays
];

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const hours = Number(item.downtimeHours || 0);
  const pct = total > 0 ? ((hours / total) * 100).toFixed(1) : 0;

  return (
    <div
      style={{
        background: "var(--card, #1e222b)",
        border: "1px solid var(--border, rgba(255,255,255,0.1))",
        borderRadius: 8,
        padding: "8px 12px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        fontSize: 12,
        maxWidth: 240,
      }}
    >
      <div style={{ fontWeight: 600, color: "var(--text-primary, #fff)", marginBottom: 4 }}>
        {item.reason}
      </div>
      {item.category && (
        <div style={{ color: "var(--text-secondary, #94a3b8)", fontSize: 11, marginBottom: 4 }}>
          {item.category}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontWeight: 700 }}>
        <span style={{ color: item.color || "#3b82f6" }}>{hours.toFixed(1)} hrs</span>
        <span style={{ color: "var(--text-secondary, #94a3b8)" }}>{pct}%</span>
      </div>
    </div>
  );
};

const DowntimeChart = ({ data = [] }) => {
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  // Clean float sum rounded to 1 decimal place
  const total = useMemo(() => {
    const sum = data.reduce((s, d) => s + (Number(d.downtimeHours) || 0), 0);
    return Math.round(sum * 10) / 10;
  }, [data]);

  // Sort descending by downtimeHours
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => (b.downtimeHours || 0) - (a.downtimeHours || 0));
  }, [data]);

  // Top 5 + "Other Causes" grouping for the Donut Chart (prevents visual clutter)
  const chartData = useMemo(() => {
    if (sorted.length <= 5) {
      return sorted.map((item, idx) => ({
        ...item,
        color: PALETTE[idx % PALETTE.length],
      }));
    }

    const top5 = sorted.slice(0, 5).map((item, idx) => ({
      ...item,
      color: PALETTE[idx],
    }));

    const otherHours = sorted.slice(5).reduce((s, d) => s + (Number(d.downtimeHours) || 0), 0);
    const otherItem = {
      reason: `Other Delays (${sorted.length - 5} reasons)`,
      category: "Various Minor Delays",
      downtimeHours: Math.round(otherHours * 10) / 10,
      color: PALETTE[5],
      isOther: true,
    };

    return [...top5, otherItem];
  }, [sorted]);

  const displayList = showAll ? sorted : sorted.slice(0, 6);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="chart-card">
        <h3>Downtime Root Cause Analysis</h3>
        <p className="status-text muted">No downtime recorded for selected filters.</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h3 style={{ margin: 0 }}>Downtime by Reason</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            Major root-cause delay contributors & planned maintenance
          </span>
        </div>
        {sorted.length > 5 && (
          <button
            type="button"
            className="icon-btn"
            style={{ fontSize: 11, padding: "4px 10px", height: "auto", minHeight: 28 }}
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Show Top 5" : `View All (${sorted.length})`}
          </button>
        )}
      </div>

      <div className="downtime-widget-layout">
        {/* Left: Decluttered Donut Chart */}
        <div className="downtime-donut-wrap">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="downtimeHours"
                nameKey="reason"
                innerRadius={68}
                outerRadius={98}
                paddingAngle={3}
                label={false}
                onMouseEnter={(_, idx) => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.reason}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Clean, centered metric */}
          <div className="downtime-center-label">
            <div className="downtime-center-value">{total.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
            <div className="downtime-center-sub">Total Hours</div>
          </div>
        </div>

        {/* Right: Clean, Ranked Breakdown with Progress Bars */}
        <div className="downtime-list" role="list">
          {displayList.map((item, idx) => {
            const hours = Number(item.downtimeHours || 0);
            const pct = total > 0 ? (hours / total) * 100 : 0;
            // Find color matching chart
            const color = idx < 5 ? PALETTE[idx] : PALETTE[5];
            const isHovered = activeIndex === idx || (idx >= 5 && activeIndex === 5);

            return (
              <div
                key={item.reason}
                className={`downtime-list-item ${isHovered ? "active" : ""}`}
                onMouseEnter={() => setActiveIndex(idx < 5 ? idx : 5)}
                onMouseLeave={() => setActiveIndex(null)}
                title={`${item.reason} (${item.category || "Downtime"}): ${hours.toFixed(1)} hrs`}
              >
                <div className="downtime-list-header">
                  <div className="downtime-list-name">
                    <span className="downtime-color-dot" style={{ backgroundColor: color }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.reason}
                    </span>
                  </div>
                  <div className="downtime-list-values">
                    <span className="downtime-list-hours">{hours.toFixed(1)} hrs</span>
                    <span className="downtime-list-pct">({pct.toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="downtime-bar-track">
                  <div
                    className="downtime-bar-fill"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DowntimeChart;
