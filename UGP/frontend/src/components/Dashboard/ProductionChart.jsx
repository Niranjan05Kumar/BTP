import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { useState } from "react";

const ProductionChart = ({ data }) => {
  const [mode, setMode] = useState("area");

  return (
    <div className="chart-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Daily Production vs Target</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="icon-btn" onClick={() => setMode("line")} style={{ padding: "6px 10px" }}>Line</button>
          <button className="icon-btn" onClick={() => setMode("area")} style={{ padding: "6px 10px" }}>Area</button>
        </div>
      </div>

      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          {mode === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="actual" stroke="#3B82F6" fill="url(#gradBlue)" name="Actual" />
              <Line type="monotone" dataKey="target" stroke="#f59e0b" name="Target" dot={false} />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#3B82F6" name="Actual" />
              <Line type="monotone" dataKey="target" stroke="#f59e0b" name="Target" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductionChart;
