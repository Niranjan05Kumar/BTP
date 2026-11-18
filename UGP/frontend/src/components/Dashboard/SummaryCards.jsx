import { useMemo } from "react";
import KpiCard from "../UI/KpiCard.jsx";

const formatNumber = (value, maximumFractionDigits = 2) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "0";
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
};

const SummaryCards = ({ summary = {}, dailyProduction = [], haulageSummary = {}, fuelSummary = {} }) => {
  // Real sparkline derived from daily production actuals
  const productionSpark = useMemo(() => {
    if (!Array.isArray(dailyProduction) || dailyProduction.length === 0) return [];
    return dailyProduction.map((d) => ({ v: d.actual || 0 }));
  }, [dailyProduction]);

  // Real production period-over-period trend
  const productionTrend = useMemo(() => {
    if (!Array.isArray(dailyProduction) || dailyProduction.length < 4) return null;
    const mid = Math.floor(dailyProduction.length / 2);
    const firstHalf = dailyProduction.slice(0, mid);
    const secondHalf = dailyProduction.slice(mid);

    const firstAvg = firstHalf.reduce((s, d) => s + (d.actual || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, d) => s + (d.actual || 0), 0) / secondHalf.length;

    if (firstAvg <= 0) return null;
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  }, [dailyProduction]);

  // Plan variance trend: Attainment vs 100%
  const attainmentTrend = summary.planAttainment !== undefined ? Number(summary.planAttainment) - 100 : null;

  const cards = [
    {
      label: "Total Production",
      value: formatNumber(summary.totalProduction, 0),
      unit: "t",
      color: "var(--accent)",
      trend: productionTrend,
      trendLabel: "trend across period",
      sparkData: productionSpark,
    },
    {
      label: "Avg Daily Production",
      value: formatNumber(summary.averageDailyProduction, 0),
      unit: "t/day",
      color: "#8b5cf6",
      subtitle: `${dailyProduction.length || 0} active operating days`,
    },
    {
      label: "Plan Attainment",
      value: formatNumber(summary.planAttainment, 1),
      unit: "%",
      color: Number(summary.planAttainment) >= 95 ? "var(--success)" : "var(--warning)",
      trend: attainmentTrend,
      trendLabel: "vs 100% budget",
    },
    {
      label: "Operating Utilization",
      value: formatNumber(summary.averageUtilization, 1),
      unit: "%",
      color: "var(--info)",
      subtitle: `DGMS Norm: ≥ 65%`,
    },
    {
      label: "Mechanical Availability",
      value: formatNumber(summary.mechanicalAvailability, 1),
      unit: "%",
      color: Number(summary.mechanicalAvailability) >= 80 ? "var(--success)" : "var(--danger)",
      subtitle: `DGMS Norm: ≥ 80%`,
    },
    {
      label: "Total Downtime",
      value: formatNumber(summary.totalDowntimeHours, 1),
      unit: "hrs",
      color: "var(--danger)",
      subtitle: `${formatNumber(summary.downtimePercent, 1)}% of scheduled time`,
    },
    {
      label: "Avg Haul Cycle Time",
      value: formatNumber(haulageSummary.averageCycleMinutes, 1),
      unit: "min",
      color: "#f59e0b",
      subtitle: `Queue wait: ${formatNumber(haulageSummary.queueWaitMinutes, 1)} min`,
    },
    {
      label: "Fuel Intensity",
      value: formatNumber(fuelSummary.averageLitersPerTonne, 3),
      unit: "L/t",
      color: "#ec4899",
      subtitle: `Avg burn: ${formatNumber(fuelSummary.averageLitersPerHour, 1)} L/hr`,
    },
    {
      label: "Operating Cost",
      value: `₹${formatNumber(summary.costPerTonne || fuelSummary.averageCostPerTonne, 2)}`,
      unit: "/t",
      color: "#10b981",
      subtitle: "Specific cost per extracted tonne",
    },
  ];

  return (
    <section className="kpi-grid">
      {cards.map((card) => (
        <KpiCard
          key={card.label}
          label={card.label}
          value={card.value}
          unit={card.unit}
          color={card.color}
          trend={card.trend}
          trendLabel={card.trendLabel}
          sparkData={card.sparkData}
          subtitle={card.subtitle}
        />
      ))}
    </section>
  );
};

export default SummaryCards;
