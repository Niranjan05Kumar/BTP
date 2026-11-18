import { LineChart, Line, ResponsiveContainer } from "recharts";

const KpiCard = ({
  label,
  value,
  unit = "",
  trend = null,
  trendLabel = "vs target",
  color = "var(--accent)",
  sparkData = [],
  subtitle = "",
}) => {
  const hasTrend = trend !== null && trend !== undefined && !Number.isNaN(Number(trend));
  const trendVal = hasTrend ? Number(trend) : 0;
  const trendUp = trendVal >= 0;
  const hasSpark = Array.isArray(sparkData) && sparkData.length > 1;

  return (
    <article className="kpi-card">
      <div className="kpi-accent" style={{ background: color }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
        <div>
          <div className="muted" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {label}
          </div>
          <div className="value" style={{ margin: "6px 0 4px" }}>
            {value}
            {unit && <span className="unit" style={{ fontSize: "14px", fontWeight: 500, marginLeft: 4 }}>{unit}</span>}
          </div>

          {hasTrend ? (
            <div className="trend" style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  color: trendUp ? "var(--success)" : "var(--danger)",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                {trendUp ? "▲ +" : "▼ "}
                {Math.abs(trendVal).toFixed(1)}%
              </span>
              <span className="muted" style={{ fontSize: "11px" }}>{trendLabel}</span>
            </div>
          ) : subtitle ? (
            <div className="muted" style={{ fontSize: "12px", marginTop: 6 }}>
              {subtitle}
            </div>
          ) : null}
        </div>

        {hasSpark && (
          <div className="spark" style={{ width: 64, height: 36, opacity: 0.85 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </article>
  );
};

export default KpiCard;
