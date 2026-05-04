import { useEffect, useState } from "react";
import { getRawRecords } from "../services/api.js";

const DataView = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

      try {
        const data = await getRawRecords({
          startDate: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10),
          shift: "all",
          equipmentType: "all",
        });
        setRows(data);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load raw records.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="surface-card data-page-card">
      <div className="section-head">
        <div>
          <h2>Raw Shift Records</h2>
          <p className="chart-meta">Detailed operational log for the selected period</p>
        </div>
        <div className="table-badge">{rows.length} records</div>
      </div>
      {loading && <p className="status-text info">Loading raw records...</p>}
      {error && <p className="status-text error">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="status-text muted">No records available.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Equipment</th>
                <th>Type</th>
                <th className="num-col">Tonnage</th>
                <th className="num-col">Trips</th>
                <th className="num-col">Op Hours</th>
                <th className="num-col">DT Hours</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td>{new Date(row.date).toISOString().slice(0, 10)}</td>
                  <td><span className="pill pill-neutral">{row.shiftCode}</span></td>
                  <td>{row.equipmentId}</td>
                  <td><span className="pill pill-soft">{row.equipmentType}</span></td>
                  <td className="num-col">{Number(row.materialTonnage).toLocaleString()}</td>
                  <td className="num-col">{row.trips}</td>
                  <td className="num-col">{Number(row.operatingHours).toFixed(2)}</td>
                  <td className="num-col">{Number(row.downtimeHours).toFixed(2)}</td>
                  <td><span className="reason-badge">{row.downtimeReason}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default DataView;
