# Data Source Register & Simulation Specification

**Project:** Development of a Web-based Production and Equipment Utilization Dashboard for Surface Mining Operations  
**Document Version:** 1.0  
**Phase:** Phase 1 — Data Provenance and Synthetic Data Engineering  

---

## 1. Hybrid Data Architecture & Segregation Principles

To maintain academic rigor and transparency, the Surface Mining Dashboard implements a **strict dual-tier data architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PROVENANCE TIERS                           │
├────────────────────────────────────────┬───────────────────────────────┤
│    TIER 1: Public Reference Benchmarks │ TIER 2: 30-Day Simulated Data │
├────────────────────────────────────────┼───────────────────────────────┤
│ • Authentic macro-level mine data      │ • Micro-level shift records   │
│ • Sourced from CIL, Ministry of Coal,  │ • Granular haulage cycles     │
│   IBM, and DGMS reports                │ • Realistic breakdown events  │
│ • Used for high-level benchmarking     │ • Physics-consistent models   │
│ • Clearly labeled: [Official Benchmark]│ • Clearly labeled: [Simulated]│
└────────────────────────────────────────┴───────────────────────────────┘
```

### Strict Governance Rules:
1. **No Data Conflation:** Public production statistics (often reported monthly or annually) must never be blended silently into the daily simulated dataset.
2. **Visual Labeling:** Every UI table, chart, and export containing simulated records must display the metadata badge:
   $$\text{"Synthetic Operational Dataset — 30 Days (Deterministic Seed)"}$$
3. **Reproducibility:** All synthetic data generation must use a pseudo-random generator with a fixed numeric seed (`SEED_BASE = 1337`) so that test runs and academic demonstrations produce identical outputs across restarts.

---

## 2. Public Mining Reference Benchmarks Register

The following authentic public data sources are registered in the system as reference benchmarks:

### 2.1 Coal India Limited (CIL) Operational Benchmarks
- **Publisher:** Coal India Limited / Ministry of Coal, Government of India.
- **Publication:** Annual Report & Monthly Provisional Production & Offtake Statements.
- **Reference URL:** [https://www.coalindia.in](https://www.coalindia.in) / [https://coal.nic.in](https://coal.nic.in)
- **Applicable Reference Mines:**
  - *Jayant Opencast Project* (Northern Coalfields Limited - NCL), Singrauli, MP (Capacity: ~25 MTPA coal, ~65 M BCM OB).
  - *Gevra Opencast Project* (South Eastern Coalfields Limited - SECL), Korba, CG (Capacity: ~50 MTPA coal).
- **Public Baseline Metrics:**
  - Overall Opencast Stripping Ratio: $\approx 2.5 - 3.2 \text{ m}^3/\text{t}$.
  - Daily Production Benchmarks: $45,000 - 75,000\text{ tonnes/day}$.
  - Shovel Fleet Payload Delivery: $12,000 - 18,000\text{ tonnes/shift}$ per mega-excavator.

### 2.2 Indian Bureau of Mines (IBM) Mineral Statistics
- **Publisher:** Indian Bureau of Mines, Ministry of Mines, Govt. of India.
- **Publication:** Monthly Statistics of Mineral Production (MSMP) & Indian Minerals Yearbook.
- **Reference URL:** [https://ibm.gov.in](https://ibm.gov.in)
- **Applicable Minerals:** Iron Ore (hematite), Bauxite, Limestone.
- **Baseline Densities & Swell:**
  - Hematite Iron Ore in-situ bulk density: $3.0 - 3.4 \text{ t/m}^3$.
  - Bauxite in-situ bulk density: $2.1 - 2.4 \text{ t/m}^3$.
  - Limestone in-situ bulk density: $2.4 - 2.6 \text{ t/m}^3$.

### 2.3 Directorate General of Mines Safety (DGMS) Standards
- **Publisher:** Directorate General of Mines Safety (DGMS), Dhanbad.
- **Standards:** Circulars on Heavy Earth Moving Machinery (HEMM) Availability and Utilization in Indian Opencast Mines.
- **Normative Availability & Utilization Standards:**
  - **Dumpers (Haul Trucks):** Minimum Mechanical Availability $\ge 80\%$; Minimum Operating Utilization $\ge 65\%$.
  - **Electric / Hydraulic Shovels:** Minimum Mechanical Availability $\ge 85\%$; Minimum Operating Utilization $\ge 70\%$.
  - **Blast-Hole Drills:** Minimum Availability $\ge 80\%$; Utilization $\ge 60\%$.
  - **Crawler Dozers:** Minimum Availability $\ge 80\%$; Utilization $\ge 50\%$.

---

## 3. 30-Day Synthetic Dataset Design

### 3.1 Temporal Coverage & Scope
- **Calendar Duration:** 30 consecutive calendar days (720 hours total per continuous asset).
- **Shift Structure:** 3 shifts per day:
  - **Shift A:** 06:00 – 14:00 (Morning Shift, 8 hours).
  - **Shift B:** 14:00 – 22:00 (Afternoon Shift, 8 hours).
  - **Shift C:** 22:00 – 06:00 (Night Shift, 8 hours).
- **Total Shifts:** $30 \text{ days} \times 3 \text{ shifts/day} = 90 \text{ shifts}$.

### 3.2 Configurable Fleet Composition (16 Units Total)

| Asset ID | Equipment Type | Model / Configuration | Capacity / Rating | Primary Assignment |
| :--- | :--- | :--- | :--- | :--- |
| **SH-01** | Hydraulic Shovel (Face) | 12.0 m³ Bucket | 22 tonnes/pass | Coal Bench Primary Excavator |
| **SH-02** | Hydraulic Excavator | 8.5 m³ Bucket | 16 tonnes/pass | Overburden Bench Top Excavator |
| **SH-03** | Hydraulic Excavator | 6.5 m³ Bucket | 12 tonnes/pass | Overburden Bench Bottom Excavator |
| **WL-01** | Wheel Loader | 5.5 m³ Bucket | 10 tonnes/pass | Stockpile & Coal Yard Clean-Up |
| **DT-101** | Dumper / Haul Truck | CAT 777E Class | 60 tonnes payload | Assigned to SH-01 (Coal) |
| **DT-102** | Dumper / Haul Truck | CAT 777E Class | 60 tonnes payload | Assigned to SH-01 (Coal) |
| **DT-103** | Dumper / Haul Truck | Komatsu HD465 Class | 55 tonnes payload | Assigned to SH-01 / SH-02 |
| **DT-104** | Dumper / Haul Truck | Komatsu HD465 Class | 55 tonnes payload | Assigned to SH-02 (OB) |
| **DT-105** | Dumper / Haul Truck | BEML BH60 Class | 50 tonnes payload | Assigned to SH-02 (OB) |
| **DT-106** | Dumper / Haul Truck | BEML BH60 Class | 50 tonnes payload | Assigned to SH-03 (OB) |
| **DT-107** | Dumper / Haul Truck | BEML BH60 Class | 50 tonnes payload | Assigned to SH-03 (OB) |
| **DZ-01** | Crawler Bulldozer | 410 HP (Komatsu D375A) | 48 tonnes weight | Face cleanup & spoil dump leveling |
| **DZ-02** | Crawler Bulldozer | 410 HP (Komatsu D375A) | 48 tonnes weight | Haul road pioneering & bench ripping |
| **DR-01** | Rotary Blast-Hole Drill | 250 mm hole diameter | 15–25 m/hr penetration| Overburden bench drilling |
| **MG-01** | Motor Grader | 16 ft Moldboard | 280 HP | Haul road crowning and maintenance |
| **WT-01** | Water Tanker | 28,000 Liters | 300 HP | Dust suppression on main haul roads |

### 3.3 Materials Mastered in Simulation
1. **`COAL_ROM` (Run-of-Mine Coal):** Category `Mineral`, Density $1.35 \text{ t/m}^3$, Swell $1.25$.
2. **`OB_SANDSTONE` (Hard Sandstone Overburden):** Category `Overburden`, Density $2.40 \text{ t/m}^3$, Swell $1.35$.
3. **`OB_SHALE` (Carbonaceous Shale):** Category `Overburden`, Density $2.10 \text{ t/m}^3$, Swell $1.30$.
4. **`TOPSOIL` (Surface Soil Layer):** Category `Topsoil`, Density $1.50 \text{ t/m}^3$, Swell $1.15$.

### 3.4 Physical & Mathematical Consistency Rules

1. **Shift Time Balance:**
   Every single shift record strictly satisfies:
   $$\text{operatingHours } (T_o) + \text{idleHours } (T_i) + \text{maintenanceHours } (T_m) = 8.00\text{ hours}$$
2. **Haulage Cycle Time Composition:**
   For every dumper trip in `HaulageCycleRecord`:
   $$t_w + t_l + t_h + t_d + t_r = T_c \quad (18 \text{ to } 32\text{ minutes typical})$$
   - Trips per 8-hour shift $\approx \frac{T_o \times 60}{T_c}$ (typically 12 to 24 trips).
   - Shift material tonnage $\approx \sum \text{payloadTonnage}$ (payload constrained to $90\% - 105\%$ rated capacity).
3. **Breakdown & Failure Alignment:**
   - If a `ShiftEquipmentRecord` logs $T_m > 1.0\text{ h}$ with an unplanned reason, a corresponding `DowntimeEvent` is generated with identical duration, matching sub-system, and `isFailure = true`.
4. **Stripping Ratio Dynamics:**
   - Over 30 days, total OB volume moved $\approx 180,000 - 240,000\text{ BCM}$ against coal extraction of $\approx 80,000 - 95,000\text{ tonnes}$, yielding a realistic volumetric stripping ratio of $2.2 - 2.8 \text{ m}^3/\text{t}$.
5. **Fuel & Cost Physics:**
   - Dumper diesel burn: $22 - 32\text{ L/operating hour}$.
   - Shovel diesel/electric burn: $35 - 55\text{ L/operating hour}$ equivalent.
   - Bulldozer diesel burn: $25 - 40\text{ L/operating hour}$.
   - Diesel cost: ₹92/L; Maintenance cost: ₹800 - ₹2,500/operating hour depending on machine size.

---

*This specification guarantees full reproducibility and engineering authenticity for the synthetic dataset.*

