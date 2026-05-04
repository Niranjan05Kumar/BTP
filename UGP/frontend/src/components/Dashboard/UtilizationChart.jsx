import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

const colorFor = (v) => {
  if (v < 60) return "var(--danger)";
  if (v < 75) return "var(--warning)";
  return "var(--success)";
};

const UtilizationChart = ({ data = [] }) => {
  const sorted = [...data].sort((a, b) => b.utilization - a.utilization);

  return (
    <div className="chart-card">
      <h3>Utilization by Equipment</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart layout="vertical" data={sorted} margin={{ top: 8, right: 8, left: 40, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" unit="%" />
          <YAxis dataKey="equipmentId" type="category" width={120} />
          <Tooltip />
          <Bar dataKey="utilization" barSize={16} radius={[8, 8, 8, 8]}>
            {sorted.map((entry, idx) => (
              <Cell key={entry.equipmentId} fill={colorFor(entry.utilization)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UtilizationChart;
