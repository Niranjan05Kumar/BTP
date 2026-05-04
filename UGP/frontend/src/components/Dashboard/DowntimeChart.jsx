import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"];

const DowntimeChart = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + (d.downtimeHours || 0), 0);

  return (
    <div className="chart-card">
      <h3>Downtime by Reason</h3>
      <div style={{ height: 320, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="downtimeHours"
              nameKey="reason"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={entry.reason} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{total}</div>
          <div className="muted">hours</div>
        </div>
      </div>
    </div>
  );
};

export default DowntimeChart;
