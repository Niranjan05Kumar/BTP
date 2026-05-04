import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const KpiCard = ({ label, value, unit, trend = 0, color = "var(--accent)", sparkData = [] }) => {
  const trendUp = Number(trend) >= 0;

  return (
    <article className="kpi-card">
      <div className="kpi-accent" style={{ background: color }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="muted">{label}</div>
          <div className="value">
            {value}
            {unit && <span className="unit">{unit}</span>}
          </div>
          <div className="trend" style={{ marginTop: 8 }}>
            <div style={{ color: trendUp ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>{trendUp ? "▲" : "▼"} {Math.abs(trend)}%</div>
            <div className="muted">vs last period</div>
          </div>
        </div>

        <div className="spark">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line dataKey="v" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </article>
  );
};

export default KpiCard;
