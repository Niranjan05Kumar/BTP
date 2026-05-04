import KpiCard from "../UI/KpiCard.jsx";

const formatNumber = (value, suffix = "") => `${Number(value || 0).toLocaleString()}${suffix}`;
const clamp = (value) => Math.max(0, Math.min(100, Number(value || 0)));

const SummaryCards = ({ summary }) => {
  const plan = clamp(summary.planAttainment);
  const util = clamp(summary.averageUtilization);
  const down = clamp(summary.downtimePercent);

  const cards = [
    { label: "Total Production", value: formatNumber(summary.totalProduction, ""), unit: " t", color: "var(--accent)", trend: 3 },
    { label: "Avg Daily Production", value: formatNumber(summary.averageDailyProduction, ""), unit: " t", color: "#8B5CF6", trend: -1 },
    { label: "Utilization", value: formatNumber(summary.averageUtilization, ""), unit: "%", color: "var(--success)", trend: 2 },
    { label: "Downtime", value: formatNumber(summary.totalDowntimeHours, ""), unit: " h", color: "var(--danger)", trend: -12 },
    { label: "Plan Attainment", value: formatNumber(summary.planAttainment, ""), unit: "%", color: "#14B8A6", trend: 5 },
  ];

  return (
    <section className="kpi-grid">
      {cards.map((c) => (
        <KpiCard
          key={c.label}
          label={c.label}
          value={c.value}
          unit={c.unit}
          trend={c.trend}
          color={c.color}
          sparkData={Array.from({ length: 8 }).map((_, i) => ({ v: Math.round(Math.random() * 100) }))}
        />
      ))}
    </section>
  );
};

export default SummaryCards;
