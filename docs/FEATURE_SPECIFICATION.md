# Feature Specification: Surface Mining Dashboard

**Project:** Development of a Web-based Production and Equipment Utilization Dashboard for Surface Mining Operations  
**Document Version:** 1.0  
**Phase:** Phase 1 — Requirements and Domain Engineering  

---

## 1. Scope & System Vision

The Surface Mining Dashboard is an analytical and operational decision-support system designed for modern opencast/surface mining environments. The application serves operations managers, mine planning engineers, shift supervisors, and academic researchers.

The system addresses both:
1. **Core Mining Analytics:** Production tracking, multi-equipment fleet availability, mechanical utilization, haulage cycle dynamics, shovel-dumper payload compatibility, overburden stripping ratios, specific fuel intensity, operating costs, and MTBF/MTTR equipment reliability.
2. **Data Transparency & Integrity:** A hybrid architecture combining authentic public reference benchmarks (e.g., Coal India Limited, Indian Bureau of Mines) with a synthetic, 30-day shift-level operational dataset. Simulated records and public benchmarks remain strictly segregated and clearly labeled throughout the platform.

---

## 2. Comprehensive Module Specifications

### Module A: Production Performance Analysis

#### Objectives & Functional Scope
- Provide multi-temporal tracking of surface mine extraction across days and shifts.
- Compare actual production against planned targets with intelligent, filter-aware prorating.
- Monitor extraction across differentiated materials (Ore/Coal vs Overburden).
- Compute daily averages, rolling trends, and shift-to-shift variance.

#### Analytical Capabilities
- **Daily Production Monitoring:** Time-series view of extracted tonnage per calendar day.
- **Shift-Wise Comparison:** Production distribution across standard mining shifts (`Shift A: 06:00-14:00`, `Shift B: 14:00-22:00`, `Shift C: 22:00-06:00`).
- **Target Attainment:** Percentage of production target achieved over the selected date range and filter scope.
- **Production Double-Counting Guard:** Strict isolation between shovel excavation volume and dumper delivery tonnage. By convention, **dumper delivered tonnage** to dump/crusher acts as primary mine production; shovel excavation is tracked as face-loading production.
- **Material-Wise Breakdown:** Stacked visualization of ore/mineral vs waste/overburden.

#### Input Parameters & Filters
- `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD).
- `shift` (`all`, `A`, `B`, `C`).
- `equipmentType` (`all`, `dumper`, `shovel`, `loader`, etc.).
- `materialId` (`all` or specific material code).

#### Edge Case Handling
- Zero production days (e.g., severe monsoon or strike) must render clean zero values without dividing by zero.
- Shift filtering must adjust the denominator target to avoid showing artificial 33% attainment.

---

### Module B: Equipment Performance Analysis

#### Supported Fleet Types
1. **Hydraulic Excavators & Shovels** (Face shovels, backhoes; e.g., 5 m³ to 15 m³ bucket capacity).
2. **Dumpers / Haul Trucks** (Off-highway mechanical/electrical drive trucks; 35 t to 120 t payload).
3. **Wheel Loaders** (Stockpile loading and clean-up; 3 m³ to 8 m³ bucket capacity).
4. **Blast-Hole Drills** (Rotary / DTH drilling rigs; drill meters per hour).
5. **Bulldozers** (Bench leveling, ripping, spoil dump maintenance; 300 to 850 HP).
6. **Motor Graders** (Haul road maintenance, spillage removal; 14 to 16 ft blade).
7. **Water Tankers** (Haul road dust suppression; 20,000 to 50,000 L capacity).

#### Analytical Metrics
- **Scheduled Time ($T_s$):** Total scheduled shift hours (8.0 hours per shift per active unit).
- **Operating Time ($T_o$):** Time during which the equipment actively operates and performs intended work.
- **Idle / Operational Delay Time ($T_i$):** Time equipment is mechanically available but not operating (e.g., meal break, shift change, waiting for dumper/shovel, blasted muckpile shortage).
- **Maintenance Downtime ($T_m$):** Time lost to planned servicing, inspection, or unplanned breakdown repair.
- **Mechanical Availability ($MA$):** Percentage of scheduled time that the machine is mechanically operable:
  $$MA = \frac{T_s - T_m}{T_s} \times 100$$
- **Use of Availability ($UA$):** Degree of utilization of available hours:
  $$UA = \frac{T_o}{T_s - T_m} \times 100$$
- **Operating Utilization ($OU$):** Net operational utilization against scheduled time:
  $$OU = \frac{T_o}{T_s} \times 100$$
- **Equipment Productivity:** Tonnes hauled per operating hour for dumpers; tonnes loaded per operating hour for shovels; drill meters per hour for drills.

---

### Module C: Downtime Analysis

#### Functional Scope
- Categorize all time losses into structured, standardized operational codes.
- Distinguish between **Planned Maintenance** (preventive maintenance, scheduled lubrication, pre-shift safety inspection) and **Unplanned Breakdowns** (hydraulic hose burst, engine failure, electrical trip, puncture).
- Isolate **Operational Delays** (blasting clearance, operator changeover, haul road obstruction, adverse weather/fog/rain, refueling queue).
- Surface root-cause drivers through Pareto ranking of downtime categories.

#### Output Views
- Downtime distribution donut chart with center metric total.
- Equipment-wise downtime stacked bar chart (Planned Maintenance vs Breakdown vs Operational Delay).
- Shift-wise downtime trends over time.

---

### Module D: Haulage Cycle-Time Analysis

#### Functional Scope
Model and evaluate the 5 discrete phases of surface mine haulage:
1. **Waiting / Queue Time ($t_w$):** Time dumper queues at the shovel loading bench.
2. **Spot & Loading Time ($t_l$):** Time to maneuver under the shovel and receive loaded passes.
3. **Loaded Haul Travel Time ($t_h$):** Travel time from loading bench to dump site or crusher.
4. **Spot & Dumping Time ($t_d$):** Maneuver time at the waste dump or crusher hopper and tipping load.
5. **Empty Return Travel Time ($t_r$):** Travel time back to the excavation bench.

#### Mathematical Consistency
$$\text{Total Cycle Time } T_c = t_w + t_l + t_h + t_d + t_r$$
- Time intervals must be mutually exclusive and non-overlapping.
- **Waiting Contribution:**
  $$\text{Queue Ratio} = \frac{t_w}{T_c} \times 100$$
- **Haulage Productivity:**
  $$P_d = \frac{\text{Payload (tonnes)}}{T_c / 60} \quad (\text{t/hr})$$

---

### Module E: Shovel–Dumper Matching Analysis

#### Functional Scope
- Evaluate fleet sizing and kinematic synchronization between loading units (shovels/loaders) and hauling units (dumpers).
- Calculate **Match Factor ($MF$)**:
  $$MF = \frac{N_d \times t_l}{N_s \times T_c}$$
  where:
  - $N_d$ = Number of active dumpers assigned to the shovel.
  - $N_s$ = Number of operating shovels (typically 1 for a dedicated bench crew).
  - $t_l$ = Average shovel loading time per dumper (minutes).
  - $T_c$ = Total dumper cycle time including loading and travel (minutes).
- **Match Factor Interpretation:**
  - $MF < 1.0$: Fleet is **shovel-constrained / dumper-deficient**; shovel waits for trucks; shovel utilization drops.
  - $MF = 1.0$: **Perfect theoretical balance**; zero queue time, zero shovel wait time (deterministic assumption).
  - $MF > 1.0$: Fleet is **dumper-constrained / over-trucked**; trucks queue at the shovel; truck waiting time increases.
- **Volumetric & Payload Pass Compatibility:**
  - Number of passes = $\lceil \text{Dumper Rated Payload} / (\text{Shovel Bucket Volume} \times \text{Material In-situ Density} \times \text{Bucket Fill Factor} / \text{Swell Factor}) \rceil$.
  - Flag over-loading risk (>110% rated payload) and under-loading inefficiency (<90% rated payload).

---

### Module F: Material & Stripping-Ratio Analysis

#### Material Master Architecture
Support diverse surface mine operations through a dynamic material catalog:
- **Coal / Lignite:** Specific energy commodity; density $\approx 1.25 - 1.45 \text{ t/m}^3$.
- **Iron Ore (Hematite/Magnetite):** High-density metal ore; density $\approx 2.5 - 3.2 \text{ t/m}^3$.
- **Bauxite:** Aluminum ore; density $\approx 1.8 - 2.2 \text{ t/m}^3$.
- **Limestone:** Cement grade; density $\approx 2.2 - 2.6 \text{ t/m}^3$.
- **Overburden (OB) / Waste Rock / Sandstone / Shale:** Density $\approx 2.0 - 2.4 \text{ t/m}^3$.
- **Topsoil:** Environmental reclamation layer; density $\approx 1.4 - 1.6 \text{ t/m}^3$.

#### Stripping Ratio Calculations
1. **Volumetric Stripping Ratio ($SR_v$):**
   $$SR_v = \frac{\text{Overburden Stripped in Bank Cubic Meters (BCM)}}{\text{Coal/Ore Extracted in Tonnes (t)}} \quad (\text{m}^3/\text{t})$$
2. **Gravimetric Stripping Ratio ($SR_m$):**
   $$SR_m = \frac{\text{Overburden Mass in Tonnes (t)}}{\text{Coal/Ore Extracted in Tonnes (t)}} \quad (\text{t/t})$$
- Density and swell conversion factors must be documented and mathematically validated.

---

### Module G: Fuel & Operating Cost Analysis

#### Analytical Metrics
- **Equipment-Wise Fuel Consumption:** Total diesel liters consumed per shift and date range.
- **Specific Fuel Consumption per Operating Hour:**
  $$F_h = \frac{\text{Fuel Liters}}{T_o} \quad (\text{L/h})$$
- **Specific Fuel Consumption per Tonne:**
  $$F_t = \frac{\text{Fuel Liters}}{\text{Material Tonnage}} \quad (\text{L/t})$$
- **Equipment Operating Cost Breakdown:**
  $$\text{Total Cost} = \text{Diesel Cost} + \text{Maintenance \& Spares Cost} + \text{Operator Labor Cost}$$
- **Cost per Tonne:**
  $$\text{Unit Cost} = \frac{\text{Total Operating Cost}}{\text{Extracted Tonnage}} \quad (\text{INR/t or \$/t})$$
- Zero-production handling: Display $0.00 or `N/A` without generating `NaN` or `Infinity`.

---

### Module H: Equipment Reliability Analysis

#### Mathematical Formulation
- **Mean Time Between Failures ($MTBF$):**
  $$MTBF = \frac{\sum T_o}{\text{Number of Unplanned Failures } N_f} \quad (\text{hours})$$
  *(Excludes planned preventive maintenance; includes only qualifying breakdown events).*
- **Mean Time To Repair ($MTTR$):**
  $$MTTR = \frac{\sum T_{\text{repair}}}{N_f} \quad (\text{hours})$$
  *(Measures maintainability and maintenance team response efficiency).*
- **Failure Frequency:** Failures per 100 operating hours.
- **Component Breakdown:** Categorization of failures by sub-system: Engine, Hydraulics, Transmission, Undercarriage/Tires, Electrical, Structural.

---

### Module I: Operational Insights & Explainable Bottleneck Detection

#### Heuristic Rule Engine
All insights must be derived from verifiable mathematical thresholds rather than static copy:
1. **Haulage Queue Bottleneck:**
   - *Rule:* If $\frac{t_w}{T_c} > 0.20$ (trucks spend $>20\%$ of cycle time in queue), trigger bottleneck warning: *"Excessive truck queuing detected at Shovel benches. Current Match Factor is [MF] (Over-trucked)."*
2. **Shovel Starvation Warning:**
   - *Rule:* If $MF < 0.80$ and shovel idle time $>1.5\text{ h/shift}$, trigger alert: *"Shovel starvation observed. Insufficient dumpers allocated to maintain continuous shovel output."*
3. **Reliability Warning:**
   - *Rule:* If $MTBF < 25\text{ hours}$ or $MTTR > 4.5\text{ hours}$ for any equipment unit, flag high maintenance risk.
4. **Plan Attainment Shortfall:**
   - *Rule:* If $\text{Attainment} < 90\%$ over 3 consecutive shifts, alert supervisor with primary downtime contributor.
5. **Payload Mismatch:**
   - *Rule:* If average payload exceeds $1.10 \times \text{Rated Capacity}$, trigger structural overload warning.

---

### Module J: Public Benchmarks & Hybrid Reference Data

#### Scope & Segregation Rules
- Register real-world baseline data from public mining reports (Coal India Limited, IBM MSMP, DGMS).
- Display a dedicated **Reference & Benchmarks** card or view comparing the current operation's availability (e.g., 75% vs DGMS 80% benchmark) and specific fuel consumption.
- Visual Badge: Synthetic operational data marked as **"Simulated Mine Operations (30 Days)"**; public reference data marked as **"Official Public Reference Data"**.

---

### Module K: Management, Raw Data & Export

- **Equipment Fleet Management View:** Detailed fleet roster with specifications, rated capacities, engine ratings, commissioning dates, and operational status.
- **Material Master Management View:** Configurable material list with in-situ densities, swell factors, and classifications.
- **Raw Shift Data Explorer:** Paginated operational log table with multi-column filtering (date, shift, equipment type, equipment ID, material) and sortable columns.
- **Export Facility:** Working CSV export button on all primary analytical tables (Production, Utilization, Downtime, Cycles, Raw Records).

---

*This specification establishes the authoritative functional target for the Surface Mining Dashboard.*

