const InsightsPanel = ({ summary = {}, downtimeReasons = [] }) => {
  const topDowntime = [...downtimeReasons].sort((a, b) => (b.downtimeHours || 0) - (a.downtimeHours || 0))[0];

  const insights = [
    {
      label: "Performance",
      text: `Plan attainment is at ${Number(summary.planAttainment || 0).toFixed(1)}%, which is ${Number(summary.planAttainment || 0) >= 95 ? "healthy" : "below target"}.`,
    },
    {
      label: "Utilization",
      text: `Average utilization is ${Number(summary.averageUtilization || 0).toFixed(1)}% across the selected period.`,
    },
    {
      label: "Downtime",
      text: topDowntime
        ? `${topDowntime.reason} is the largest downtime driver at ${Number(topDowntime.downtimeHours || 0).toFixed(1)} hours.`
        : "No downtime breakdown available for the current filter range.",
    },
  ];

  return (
    <section className="chart-card insights-card">
      <div className="insights-header">
        <div>
          <h3>Insights</h3>
          <p className="chart-meta">Live operational summary</p>
        </div>
        <span className="live-pill">Live</span>
      </div>

      <div className="insights-list">
        {insights.map((item) => (
          <article key={item.label} className="insight-item">
            <span className="insight-label">{item.label}</span>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default InsightsPanel;
