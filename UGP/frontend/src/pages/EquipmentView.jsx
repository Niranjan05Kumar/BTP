import { useEffect, useState } from "react";
import { getUtilization } from "../services/api.js";

const EquipmentView = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 13);

      try {
        const data = await getUtilization({
          startDate: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10),
          equipmentType: "all",
          shift: "all",
        });
        setRows(data);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load equipment data.");
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
          <h2>Equipment Utilization Table</h2>
          <p className="chart-meta">Sorted by highest utilization for quick review</p>
        </div>
        <div className="table-badge">{rows.length} equipment</div>
      </div>
      {loading && <p className="status-text info">Loading equipment data...</p>}
      {error && <p className="status-text error">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="status-text muted">No equipment records found.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Type</th>
                <th className="num-col">Operating Hours</th>
                <th className="num-col">Downtime Hours</th>
                <th className="num-col">Utilization %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.equipmentId}>
                  <td>{row.equipmentId}</td>
                  <td><span className="pill pill-soft">{row.equipmentType}</span></td>
                  <td className="num-col">{Number(row.operatingHours).toFixed(2)}</td>
                  <td className="num-col">{Number(row.downtimeHours).toFixed(2)}</td>
                  <td className="num-col"><span className="util-chip">{Number(row.utilization).toFixed(2)}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default EquipmentView;
