import { getEquipmentSummary } from "./equipmentService.js";
import { getHaulageSummary } from "./haulageService.js";
import { getFleetMatchingAnalysis } from "./fleetMatchingService.js";
import { getDailyProductionWithTarget } from "./productionService.js";
import { getReliabilityMetrics } from "./reliabilityService.js";
import { getStrippingRatioAnalysis } from "./materialService.js";

/**
 * Operational Insights & Bottleneck Detection Service
 * Evaluates rule-based, explainable engineering heuristics.
 */

export const getOperationalInsights = async (filters) => {
  const [equipmentSummary, haulageSummary, fleetMatching, productionTargetData, reliabilityData, strippingData] =
    await Promise.all([
      getEquipmentSummary(filters),
      getHaulageSummary(filters),
      getFleetMatchingAnalysis(filters),
      getDailyProductionWithTarget(filters),
      getReliabilityMetrics(filters),
      getStrippingRatioAnalysis(filters),
    ]);

  const insights = [];

  // 1. Haulage Queue Bottleneck
  const queueRatio = haulageSummary.queueContributionPercent || 0;
  if (queueRatio > 18.0) {
    insights.push({
      id: "QUEUE_BOTTLENECK",
      category: "Haulage",
      severity: queueRatio > 25.0 ? "critical" : "warning",
      title: "Elevated Dumper Queue Times at Excavator Benches",
      metric: `${queueRatio.toFixed(1)}% of cycle time in queue`,
      finding: `Dumpers are spending an average of ${haulageSummary.queueWaitMinutes} minutes waiting per cycle at shovel loading faces.`,
      recommendation: "Rebalance dumper dispatch pacing or temporarily divert 1-2 haul trucks to longer overburden dumps to alleviate bench bunching.",
    });
  }

  // 2. Shovel-Dumper Match Factor Alerts
  fleetMatching.forEach((fm) => {
    if (fm.matchFactor < 0.85) {
      insights.push({
        id: `UNDER_TRUCKED_${fm.shovelId}`,
        category: "Fleet Matching",
        severity: "warning",
        title: `Shovel Starvation Alert on ${fm.shovelId}`,
        metric: `Match Factor: ${fm.matchFactor.toFixed(2)}`,
        finding: `Shovel ${fm.shovelId} (${fm.shovelModel}) is under-trucked with only ${fm.activeDumpersCount} haulers assigned. Excavator idle wait time is elevated.`,
        recommendation: "Assign 1 additional dumper to this crew to maximize shovel dig-rate productivity.",
      });
    } else if (fm.matchFactor > 1.15) {
      insights.push({
        id: `OVER_TRUCKED_${fm.shovelId}`,
        category: "Fleet Matching",
        severity: "warning",
        title: `Over-Trucking Congestion on ${fm.shovelId}`,
        metric: `Match Factor: ${fm.matchFactor.toFixed(2)}`,
        finding: `Excess haulers (${fm.activeDumpersCount} trucks) assigned to ${fm.shovelId}. Trucks are queuing ${fm.avgQueueWaitMinutes} min on average.`,
        recommendation: "Reassign surplus dumpers to satellite stockpile rehandling or longer overburden dump runs.",
      });
    }
  });

  // 3. Plan Attainment Shortfall
  const totalActual = productionTargetData.reduce((s, d) => s + (d.actual || 0), 0);
  const totalTarget = productionTargetData.reduce((s, d) => s + (d.target || 0), 0);
  const overallAttainment = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 100;

  if (overallAttainment < 92.0 && totalTarget > 0) {
    insights.push({
      id: "PRODUCTION_DEFICIT",
      category: "Production",
      severity: overallAttainment < 85.0 ? "critical" : "warning",
      title: "Production Plan Attainment Deficit",
      metric: `${overallAttainment.toFixed(1)}% Attainment`,
      finding: `Actual mine production (${totalActual.toLocaleString()} t) is lagging budgeted target (${totalTarget.toLocaleString()} t) across the selected period.`,
      recommendation: "Review primary maintenance downtime drivers and increase equipment availability on high-capacity excavators.",
    });
  }

  // 4. Mechanical Availability vs DGMS Benchmark
  const availability = equipmentSummary.averageAvailability || 0;
  if (availability < 80.0 && availability > 0) {
    insights.push({
      id: "AVAILABILITY_DEFICIT",
      category: "Reliability",
      severity: availability < 75.0 ? "critical" : "warning",
      title: "Fleet Availability Below Statutory DGMS Norm (80%)",
      metric: `${availability.toFixed(1)}% Mechanical Availability`,
      finding: `Average fleet availability of ${availability.toFixed(1)}% is below the DGMS benchmark norm of 80% for surface mining HEMM.`,
      recommendation: "Audit preventive maintenance execution and address chronic sub-system breakdown causes.",
    });
  }

  // 5. Reliability MTTR Alert
  const fleetMttr = reliabilityData.fleetMttrHours || 0;
  if (fleetMttr > 2.5) {
    insights.push({
      id: "HIGH_MTTR",
      category: "Maintenance",
      severity: "warning",
      title: "Prolonged Mean Time To Repair (MTTR)",
      metric: `MTTR: ${fleetMttr.toFixed(1)} hours`,
      finding: `Average repair turnaround time of ${fleetMttr.toFixed(1)} hours suggests spare parts availability or maintenance technician response delays.`,
      recommendation: "Stock critical fast-moving spares (hydraulic hoses, cylinders, electrical relays) directly at field workshop containers.",
    });
  }

  // 6. Positive Production Attainment Note if performing well
  if (overallAttainment >= 95.0) {
    insights.push({
      id: "STRONG_ATTAINMENT",
      category: "Performance",
      severity: "positive",
      title: "Healthy Production Target Delivery",
      metric: `${overallAttainment.toFixed(1)}% Attainment`,
      finding: `Cumulative extraction is tracking within optimal target tolerances (${overallAttainment.toFixed(1)}%).`,
      recommendation: "Maintain current shovel-dumper dispatch balance and bench scheduling.",
    });
  }

  return {
    summary: {
      totalInsights: insights.length,
      criticalCount: insights.filter((i) => i.severity === "critical").length,
      warningCount: insights.filter((i) => i.severity === "warning").length,
      positiveCount: insights.filter((i) => i.severity === "positive").length,
    },
    insights,
  };
};

