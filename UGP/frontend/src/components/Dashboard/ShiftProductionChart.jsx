import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";

const ShiftProductionChart = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="chart-card">
      <h3>Shift Production</h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="shiftCode" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="production" fill="#10B981" radius={[8, 8, 8, 8]} barSize={28}>
              <LabelList dataKey="production" position="top" formatter={(v) => v} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="status-text muted">No shift production data for selected filters.</p>
      )}
    </div>
  );
};

export default ShiftProductionChart;
