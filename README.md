# Development of a Web-based Production and Equipment Utilization Dashboard for Surface Mining Operations

> **Undergraduate B.Tech Capstone Project**  
> *Interdisciplinary Implementation in Mining Engineering & Computer Science*  
> Final Production Release & Deployment

[![Live Frontend Application](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-success?style=for-the-badge&logo=vercel)](https://btp-xi-ivory.vercel.app/)
[![Backend API Service](https://img.shields.io/badge/API-Render%20Cloud-informational?style=for-the-badge&logo=render)](https://surface-mining-api.onrender.com)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![React Version](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Automated Tests](https://img.shields.io/badge/Tests-26%20Passed-brightgreen?style=for-the-badge)](./UGP/backend/test)

---

## 🌐 Live Production Deployments

| Component | Platform | URL / Endpoint | Status |
| :--- | :--- | :--- | :--- |
| **Interactive Dashboard (Frontend)** | Vercel CDN | [https://btp-xi-ivory.vercel.app/](https://btp-xi-ivory.vercel.app/) | **Live & Operational** |
| **RESTful Analytics API (Backend)** | Render Web Service | [https://surface-mining-api.onrender.com/api](https://surface-mining-api.onrender.com/api) | **Live & Operational** |
| **API Health / Base Route** | Render Web Service | [https://surface-mining-api.onrender.com/](https://surface-mining-api.onrender.com/) | **Live & Operational** |
| **Database Cluster** | MongoDB Atlas | AWS / Shared Cluster (`btp.rc9wqsd.mongodb.net`) | **Connected & Active** |

---

## 1. Project Overview

Surface mining operations represent capital-intensive, multi-stage industrial engineering environments governed by the coordinated dispatch of Heavy Earthmoving Machinery (HEMM) such as hydraulic excavators, electric rope shovels, rear-dump trucks, crawler dozers, and blast-hole drill rigs. In open-pit extraction, operating profitability, safety margins, and mineral recovery targets hinge directly on the systematic minimization of equipment idle time, elimination of haulage route bottlenecks, balanced fleet allocation, and proactive tracking of mechanical reliability.

Traditionally, surface mine reporting has relied on fragmented end-of-shift paper logbooks, manual spreadsheets, and delayed reporting intervals. This creates an information lag of 12 to 24 hours between field equipment breakdowns and managerial awareness.

This project delivers a **full-stack, web-based production and equipment utilization analytics dashboard** designed specifically for surface mining workflows. The platform processes granular operational logs, evaluates standard mining engineering Key Performance Indicators (KPIs) through high-performance aggregation pipelines, and delivers interactive visual analytics across 10 dedicated analytical views. By contextualizing raw shift logs against statutory benchmarks from **Coal India Limited (CIL)**, the **Directorate General of Mines Safety (DGMS)**, and the **Indian Bureau of Mines (IBM)**, the system equips mining engineers, shift supervisors, and fleet dispatchers with real-time operational decision support.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        SURFACE MINING DASHBOARD (APP SHELL)                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Overview] [Production] [Equipment] [Downtime] [Haulage]                               │
│ [Shovel-Dumper Matching] [Material & Stripping] [Fuel & Cost] [Insights] [Data]        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Objectives

The engineering and functional objectives implemented in this system include:

1. **Production Monitoring & Budget Comparison**: Continuous tracking of daily, shift-wise, and material-wise extraction tonnage against budgeted production targets to evaluate plan attainment and identify production shortfalls.
2. **HEMM Utilization & Availability Diagnostics**: Standardized tracking of machine operational states (operating, idling, maintenance, electrical/mechanical downtime) to calculate Mechanical Availability ($MA$), Operating Utilization ($OU$), and Use of Availability ($UA$).
3. **Failure Classification & Reliability Analysis**: Rigorous distinction between scheduled preventive maintenance and unplanned breakdown incidents according to DGMS reporting standards, computing Mean Time Between Failures ($MTBF$) and Mean Time To Repair ($MTTR$).
4. **Kinematic Haulage Cycle-Time Decomposition**: Granular measurement of the 5 non-overlapping phases of truck haulage (queuing, loading, loaded hauling, dumping, and empty return) to isolate bench starvation and dump hopper queuing.
5. **Shovel–Dumper Fleet Matching**: Quantitative evaluation of shovel-truck fleet synchronization using the SME Match Factor ($MF$) and bucket-pass calculations to prevent truck bunching and shovel idling.
6. **Material Stratum & Stripping Ratio Analysis**: Quantitative tracking of mineral extraction versus overburden removal, providing both Volumetric ($SR_v \text{ in m}^3/\text{t}$) and Gravimetric ($SR_m \text{ in t/t}$) stripping ratios.
7. **Specific Energy & Fuel Burn Accounting**: Equipment-level fuel efficiency evaluation ($\text{L/hr}$ and $\text{L/tonne}$) and operating cost allocation.
8. **Automated Operational Heuristics**: Deterministic, rule-based bottleneck detection that highlights fleet imbalances, critical equipment failures, and high fuel burn rates without black-box opacity.
9. **Centralized Data Management & Reporting**: Unified master data exploration, granular log pagination, and instant client-side CSV reporting for operational reviews.

---

## 3. Major Features

### 3.1 Production Performance Analysis
- **Daily Extraction Tracking**: Area and line curves displaying actual production output (tonnes) versus scheduled budget targets over custom temporal windows.
- **Shift-Wise Partitioning**: Comparative analysis across the three operational shifts (Shift A: 06:00–14:00, Shift B: 14:00–22:00, Shift C: 22:00–06:00) to detect variance caused by shift changeovers, lighting, or blasting bench clearance.
- **Material-Wise Breakdown**: Clear segregation of saleable run-of-mine (ROM) mineral tonnage from overburden (OB) waste removal.
- **Attainment & Loss Metrics**: Calculation of target attainment percentages and production shortfall quantities ($\max(0, \text{Target} - \text{Actual})$).

### 3.2 Equipment Performance & Utilization
- **Hours Reconciliation**: Auditing of the 8 scheduled hours per shift into mutually exclusive operating, idle, and maintenance durations.
- **Dual Availability Indices**: Explicit separation of **Mechanical Availability** (machine readiness) and **Operating Utilization** (actual work performed as a fraction of total calendar time).
- **Use of Availability ($UA$)**: Measurement of dispatch management effectiveness—quantifying what proportion of mechanically available time was actively converted into productive work.
- **Equipment Fleet Comparison**: Ranked bar charts and tabular matrices comparing individual machines across excavator, dumper, dozer, and drill fleets.

### 3.3 Downtime & Reliability Engineering
- **DGMS Categorization**: Strict partitioning of downtime into three statutory tiers:
  - *Planned Maintenance (PM)*: Scheduled 250-hour servicing, track tensioning, lubrication.
  - *Unplanned Breakdowns*: Sudden mechanical, hydraulic, transmission, electrical, or structural component failures.
  - *Operational Delays*: Blasting delays, shift handover, refueling queues, dust/weather stoppages.
- **Pareto Root-Cause Analysis**: Pareto-ranked distribution of downtime hours and event frequencies, isolating the top subsystems responsible for 80% of machine downtime.
- **Reliability KPIs ($MTBF$ & $MTTR$)**: Statistical computation of Mean Time Between Failures and Mean Time To Repair, rigorously calculated using only qualifying mechanical failure events.

### 3.4 Haulage Kinematics & Cycle-Time Decomposition
- **5-Phase Haulage Cycle**: Decomposition of every dump truck cycle into:
  $$\text{Total Cycle Time } (T_c) = t_{\text{queue}} + t_{\text{load}} + t_{\text{haul}} + t_{\text{dump}} + t_{\text{return}}$$
- **Cycle Efficiency & Bottleneck Ratios**: Identification of queue delay percentages at loading faces and dumping points.
- **Dumper Productivity**: Haulage throughput metrics measured in delivered payload tonnes per operating hour ($\text{t/hr}$).

### 3.5 Shovel–Dumper Fleet Matching
- **SME Match Factor Computation**: Real-time evaluation of loading shovel and hauling truck ratios:
  $$\text{Match Factor } (MF) = \frac{N_d \times t_l}{N_s \times T_c}$$
- **Fleet Coordination Regimes**:
  - *Balanced Fleet* ($0.85 \le MF \le 1.05$): Optimal shovel and truck pairing with minimal idle waiting.
  - *Under-Trucked Fleet* ($MF < 0.85$): Loading shovel is starved of trucks, resulting in excavator idle time.
  - *Over-Trucked Fleet* ($MF > 1.05$): Excessive dumpers assigned to the shovel, resulting in truck queue congestion.
- **Bucket Pass Calculation**: Mathematical calculation of required excavator loading passes ($N_p$) based on rated dumper payload, bucket capacity, and material bulk density.

### 3.6 Material Stratum & Stripping Analysis
- **Dual Stripping Ratios**:
  - *Volumetric Stripping Ratio ($SR_v$)*: Expressed in $\text{m}^3\text{ (BCM) of Overburden per Tonne of Mineral}$.
  - *Gravimetric Stripping Ratio ($SR_m$)*: Expressed in $\text{Tonnes of Overburden per Tonne of Mineral}$.
- **Rock Density & Swell Factors**: Conversion factors applied across in-situ bank cubic meters (BCM) and loose cubic meters (LCM) for sandstone, shale, and coal strata.

### 3.7 Fuel & Operating Cost Efficiency
- **Diesel Consumption Intensity**: Equipment-level fuel accounting tracking total liters consumed, specific burn rate per operating hour ($\text{L/hr}$), and fuel consumption per tonne moved ($\text{L/t}$).
- **Operating Cost Distribution**: Variable cost modeling tracking fuel expenditure, operator labor, routine consumables, and active repair expenses.
- **Unit Cost per Tonne**: Financial operational metric tracking total extraction cost per delivered ROM mineral tonne ($\text{₹/t}$).

### 3.8 Rule-Based Operational Insights
- **Deterministic Heuristics**: Automated operational diagnostics evaluating live KPI thresholds:
  - *Availability Deficit Alert*: Triggered when fleet mechanical availability drops below the statutory CIL benchmark of 85%.
  - *Haulage Bottleneck Alert*: Triggered when queue time exceeds 18% of total haulage cycle time.
  - *Fleet Mismatch Alert*: Flags active shovel crews operating in under-trucked or over-trucked conditions.
  - *Excessive Fuel Burn Alert*: Flags equipment operating $> 15\%$ above manufacturer fuel baseline curves.
- *Note*: These insights are generated via deterministic, transparent rules and threshold logic rather than opaque machine-learning models.

---

## 4. Dashboard Pages / Analytical Modules

The web application is organized into **10 dedicated modules** accessible via the top-level navigation:

| # | Route | Module Name | Primary Operational Purpose |
| :-: | :--- | :--- | :--- |
| **1** | `/` | **Executive Operations Overview** | Consolidated executive dashboard displaying high-level summary KPIs (Production, Availability, Utilization, Downtime Hours, Unit Cost), production area curves, and a Pareto downtime widget. |
| **2** | `/production` | **Production Performance Analysis** | Deep-dive production monitoring comparing actual extraction against budgeted targets, shift comparisons (A, B, C), and ROM vs. Overburden volume trends. |
| **3** | `/equipment` | **Equipment Fleet Performance & Availability** | Granular equipment fleet analysis comparing operating hours, idle time, mechanical availability ($MA$), operating utilization ($OU$), and use of availability ($UA$). |
| **4** | `/downtime` | **Downtime & Equipment Reliability** | Breakdown diagnostics categorizing downtime into planned maintenance, mechanical failure, and operational delays, with MTBF and MTTR metrics. |
| **5** | `/haulage` | **Haulage Cycle Kinematics** | Granular breakdown of truck cycle times into 5 kinematic phases (queue, load, haul, dump, return), surfacing bench bottleneck percentages and hourly dumper throughput. |
| **6** | `/fleet-matching` | **Shovel–Dumper Fleet Matching** | Kinematic pairing analysis calculating SME Match Factors, required bucket loading passes, and truck allocation recommendations. |
| **7** | `/materials` | **Material Stratum & Stripping Analysis** | Geological strata monitoring tracking mineral output, waste overburden volume (BCM), and volumetric/gravimetric stripping ratios. |
| **8** | `/fuel-cost` | **Fuel Consumption & Operating Cost Efficiency** | Energy and cost efficiency tracking equipment-level diesel burn rates ($\text{L/hr}$, $\text{L/t}$) and unit operating costs per tonne. |
| **9** | `/insights` | **Operational Insights & Bottleneck Detection** | Automated heuristic diagnostic engine surfacing operational anomalies, availability shortfalls, haulage delays, and fleet imbalances. |
| **10** | `/data` | **Management & Master Data Explorer** | Multi-tab operational ledger providing paginated access to raw shift records, haulage cycle logs, downtime incidents, equipment catalog, and official public mining benchmarks. |

---

## 5. Mathematical Formulations & Mining Engineering KPIs

The system evaluates mining metrics implemented in backend domain services according to the following formulas:

### 5.1 Equipment Availability & Utilization
$$\text{Mechanical Availability (MA)} = \left( \frac{\text{Scheduled Hours} - \text{Maintenance Hours}}{\text{Scheduled Hours}} \right) \times 100 \quad [\%]$$

$$\text{Operating Utilization (OU)} = \left( \frac{\text{Operating Hours}}{\text{Scheduled Hours}} \right) \times 100 \quad [\%]$$

$$\text{Use of Availability (UA)} = \left( \frac{\text{Operating Hours}}{\text{Scheduled Hours} - \text{Maintenance Hours}} \right) \times 100 \quad [\%]$$

*Reconciliation Constraint*: For every shift record, $\text{Scheduled Hours} = \text{Operating Hours} + \text{Idle Hours} + \text{Maintenance Hours} = 8.0\text{ hrs}$.

### 5.2 Equipment Reliability Metrics (DGMS Framework)
$$\text{Mean Time Between Failures (MTBF)} = \frac{\sum \text{Operating Hours}}{\sum \text{Qualifying Mechanical Failures}} \quad [\text{hours/failure}]$$

$$\text{Mean Time To Repair (MTTR)} = \frac{\sum \text{Active Breakdown Repair Hours}}{\sum \text{Qualifying Mechanical Failures}} \quad [\text{hours/repair}]$$

*Implementation Guard*: Only events flagged with `isFailure: true` (unplanned mechanical/electrical breakdowns) are included in the denominator; routine preventive maintenance and operational waiting delays are strictly excluded to prevent MTBF/MTTR skew.

### 5.3 Haulage Kinematics & Fleet Matching (SME Standard)
$$\text{Total Haulage Cycle Time } (T_c) = t_{\text{queue}} + t_{\text{load}} + t_{\text{haul}} + t_{\text{dump}} + t_{\text{return}} \quad [\text{minutes}]$$

$$\text{SME Match Factor } (MF) = \frac{N_d \times t_{\text{load}}}{N_s \times T_c}$$
Where:
- $N_d$ = Number of operating dump trucks assigned
- $N_s$ = Number of operating loading shovels assigned
- $t_{\text{load}}$ = Average truck loading time (minutes)
- $T_c$ = Total truck cycle time (minutes)

$$\text{Excavator Loading Passes } (N_p) = \left\lceil \frac{\text{Dumper Rated Payload (tonnes)}}{V_{\text{bucket}} \times \rho_{\text{in-situ}}} \right\rceil$$

### 5.4 Stripping Ratios & Rock Mechanics
$$\text{Volumetric Stripping Ratio } (SR_v) = \frac{\text{Overburden Volume (Bank Cubic Meters)}}{\text{Mineral Mass (Tonnes)}} \quad [\text{m}^3/\text{t}]$$

$$\text{Gravimetric Stripping Ratio } (SR_m) = \frac{\text{Overburden Mass (Tonnes)}}{\text{Mineral Mass (Tonnes)}} \quad [\text{t/t}]$$

$$\text{Overburden Mass} = \text{Overburden BCM} \times \rho_{\text{rock}} \quad (\text{where } \rho_{\text{rock}} \approx 2.40\text{ t/m}^3)$$

### 5.5 Energy & Operational Cost Efficiency
$$\text{Hourly Fuel Burn Rate} = \frac{\text{Total Diesel Consumed (L)}}{\text{Operating Hours (hr)}} \quad [\text{L/hr}]$$

$$\text{Specific Fuel Consumption} = \frac{\text{Total Diesel Consumed (L)}}{\text{Total Extracted ROM Tonnage (t)}} \quad [\text{L/t}]$$

$$\text{Unit Cost of Extraction} = \frac{\sum (\text{Fuel Cost} + \text{Maintenance Cost} + \text{Consumables} + \text{Labor})}{\text{Total Extracted ROM Tonnage (t)}} \quad [₹/\text{t}]$$

---

## 6. System Architecture & Data Flow

The system employs a decoupled, multi-tier client-server architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          OPERATIONAL DATA LAYER                        │
│   • Public Mining Reference Norms (CIL, DGMS, IBM Benchmark Standards) │
│   • 30-Day Deterministic HEMM Operations Telemetry Simulation Engine   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Seed / Ingest
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MONGODB ATLAS (DATA TIER)                       │
│   • 9 Indexed Mongoose Schemas (Mines, Fleet Master, Shift Logs, etc.) │
│   • Compound Indexes on { date: 1, shiftCode: 1, equipmentType: 1 }    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Query Streams
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS 5 REST API (BACKEND TIER)                  │
│   • Route Layer: /api/kpi/* and /api/data/*                            │
│   • Validation & Sanitization Middleware (ISO dates, Shift Enums)      │
│   • 8 Dedicated Mining Domain Services (Production, Reliability, etc.) │
│   • MongoDB Multi-Stage Aggregation Pipelines ($match, $group, $facet) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON Response
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     REACT 19 + VITE (FRONTEND CLIENT)                  │
│   • Centralized FilterContext (Temporal, Shift, Fleet, Material state) │
│   • 10 Dedicated Module Views with Recharts 3.8 Responsive Visuals    │
│   • Glassmorphic Design System with Dynamic Theme Switching            │
│   • Client-Side CSV Data Export Utility                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Database Models & Schema Design

The MongoDB database utilizes **9 Mongoose schemas** designed for open-pit mining data:

| # | Model Name | Primary Collection | Functional Description & Key Fields |
| :-: | :--- | :--- | :--- |
| **1** | `Mine` | `mines` | Master deposit attributes: `mineId`, `name`, `location`, `mineralType`, `benchCount`, `totalPermittedAreaHa`. |
| **2** | `Material` | `materials` | Strata catalog: `materialId`, `name`, `category` (Mineral, Overburden, Waste, Topsoil), `densityInSitu`, `swellFactor`. |
| **3** | `Equipment` | `equipments` | HEMM specifications: `equipmentId`, `name`, `type` (shovel, dumper, dozer, drill), `model`, `capacity`, `fuelBurnRateBaseline`. |
| **4** | `DataSource` | `datasources` | Provenance ledger tracking regulatory benchmark standards: `sourceId`, `organization` (CIL, DGMS, IBM), `standardCategory`, `referenceYear`. |
| **5** | `ShiftEquipmentRecord` | `shiftequipmentrecords` | Core operational fact table: `date`, `shiftCode` (A/B/C), `equipmentId`, `operatingHours`, `idleHours`, `maintenanceHours`, `materialTonnage`, `fuelConsumedLiters`, `operatingCost`. |
| **6** | `ProductionTarget` | `productiontargets` | Budgeted production benchmarks: `date`, `shiftCode`, `materialCategory`, `targetTonnage`, `targetBcm`. |
| **7** | `HaulageCycleRecord` | `haulagecyclerecords` | Truck cycle kinematic records: `cycleId`, `dumperId`, `shovelId`, `queueTimeMinutes`, `loadTimeMinutes`, `haulLoadedTimeMinutes`, `dumpTimeMinutes`, `returnEmptyTimeMinutes`, `payloadTonnes`. |
| **8** | `DowntimeEvent` | `downtimeevents` | Equipment stoppage ledger: `eventId`, `equipmentId`, `category` (Maintenance, Breakdown, Delay), `subSystem` (Hydraulics, Engine, Electrical, etc.), `durationHours`, `isFailure`. |
| **9** | `MineProductionRecord` | `mineproductionrecords` | Daily pit totals: `date`, `mineId`, `coalTonnage`, `overburdenBcm`, `overburdenTonnage`, `strippingRatioVolumetric`, `strippingRatioGravimetric`. |

---

## 8. Technology Stack

| Layer | Technology | Version | Purpose in Application |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.2.0` | Declarative component UI and virtual DOM rendering. |
| **Application Bundler** | Vite | `^8.0.0` | Ultra-fast HMR and Rollup-based production code splitting. |
| **Client Routing** | React Router | `^7.1.3` | SPA client-side routing with clean URL navigation. |
| **Data Visualization** | Recharts | `^3.8.0` | Interactive SVG charts (Area, Bar, Line, Donut, Stacked Bar). |
| **HTTP Client** | Axios | `^1.7.9` | Promise-based asynchronous HTTP client with timeout guards. |
| **State Management** | React Context API | Native | Centralized `FilterContext` synchronizing global query parameters. |
| **Icons & Design** | Lucide React | `^1.16.0` | Clean, lightweight SVG engineering and interface icons. |
| **Styling & Theme** | CSS3 & Custom Variables | Native | Glassmorphic design tokens, responsive CSS grid, light/dark/system themes. |
| **Backend Runtime** | Node.js (ESM) | `>= 18.0.0` | Asynchronous JavaScript runtime utilizing native ES Modules. |
| **Backend Framework** | Express | `^5.2.1` | RESTful API routing, sanitization middleware, and error handling. |
| **Database ODM** | Mongoose | `^9.2.1` | Schema validation, type casting, and MongoDB aggregation pipelines. |
| **Database** | MongoDB Atlas | Cloud | Distributed cloud document database with indexed collections. |
| **Test Runner** | Node Test Runner (`node:test`) | Native | Built-in test execution for unit and formula validation suites. |

---

## 9. REST API Documentation

All API endpoints are hosted under the `/api` prefix. Query parameters support global filtering across date ranges, shifts, equipment types, and material strata.

### 9.1 KPI & Analytics Endpoints (`/api/kpi`)

| HTTP Method | Route Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/kpi/summary` | `start, end, shift, type, material` | Executive KPIs: Total Production, Attainment %, Availability %, Utilization %, Lost Downtime, Cost/Tonne. |
| `GET` | `/api/kpi/production/daily` | `start, end, shift, material` | Daily production actuals vs budgeted target curves. |
| `GET` | `/api/kpi/production/by-shift`| `start, end, material` | Shift-wise (A, B, C) production volume comparisons. |
| `GET` | `/api/kpi/production/by-material`| `start, end, shift` | Material-wise extraction volume (Mineral vs. Overburden). |
| `GET` | `/api/kpi/equipment/utilization` | `start, end, shift, type` | Fleet operating, idle, and maintenance hours with MA and OU percentages. |
| `GET` | `/api/kpi/equipment/summary` | `start, end, shift, type` | Machine-wise tabular performance matrix and hour totals. |
| `GET` | `/api/kpi/downtime/by-reason` | `start, end, shift, type` | Pareto breakdown of downtime hours grouped by root-cause reason code. |
| `GET` | `/api/kpi/downtime/by-category`| `start, end, shift, type` | Stoppage distribution across Planned Maintenance, Breakdowns, and Delays. |
| `GET` | `/api/kpi/downtime/by-subsystem`| `start, end, shift, type` | Mechanical failure distribution across sub-assemblies (Hydraulics, Engine, Electrical, etc.). |
| `GET` | `/api/kpi/reliability/metrics`| `start, end, shift, type` | MTBF, MTTR, and failure frequencies evaluated for qualifying breakdown events. |
| `GET` | `/api/kpi/haulage/summary` | `start, end, shift` | Average 5-phase haulage cycle times and queue bottleneck percentages. |
| `GET` | `/api/kpi/haulage/by-dumper` | `start, end, shift` | Per-dumper payload, cycle counts, and hourly productivity ($t/\text{hr}$). |
| `GET` | `/api/kpi/fleet/matching` | `start, end, shift` | Shovel–Dumper SME Match Factor ($MF$), fleet balance status, and bucket passes ($N_p$). |
| `GET` | `/api/kpi/materials/stripping-ratio` | `start, end, shift` | Volumetric ($SR_v \text{ m}^3/\text{t}$) and Gravimetric ($SR_m \text{ t/t}$) stripping ratios. |
| `GET` | `/api/kpi/fuel/summary` | `start, end, shift, type` | Specific fuel burn rates ($\text{L/hr}$, $\text{L/t}$) and operational cost allocations. |
| `GET` | `/api/kpi/insights` | `start, end, shift, type` | Rule-based operational alerts and bottleneck detections. |

### 9.2 Master & Fact Data Endpoints (`/api/data`)

| HTTP Method | Route Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/data/records` | `start, end, shift, type, page, limit` | Paginated raw shift equipment fact logs. |
| `GET` | `/api/data/equipment` | *None* | Complete HEMM master equipment catalog and baseline capacities. |
| `GET` | `/api/data/materials` | *None* | Stratum master catalog including density and swell factors. |
| `GET` | `/api/data/mines` | *None* | Mine site metadata and bench configuration. |
| `GET` | `/api/data/sources` | *None* | Registered reference regulatory data sources (CIL, DGMS, IBM). |
| `GET` | `/api/data/benchmarks` | *None* | Official public sector mining availability and productivity norms. |
| `GET` | `/api/data/cycles` | `start, end, shift, page, limit` | Paginated raw haulage cycle kinematic records. |
| `GET` | `/api/data/downtime-events` | `start, end, shift, page, limit` | Paginated raw equipment breakdown and delay incident logs. |
| `GET` | `/api/data/targets` | `start, end, shift` | Budgeted production target records. |

---

## 10. Interactive Filtering & User Experience

### 10.1 Global Filter Bar
The application provides a persistent `FiltersBar` component mounted across all views through `FilterContext`:
- **Date Range Picker**: Interactive Start Date and End Date selectors with bounds checking.
- **Shift Filter**: Dropdown selector supporting `All Shifts`, `Shift A` (Morning), `Shift B` (Afternoon), and `Shift C` (Night).
- **Equipment Type Filter**: Single-click filtering across `All Fleet Types`, `Shovels`, `Dump Trucks`, `Dozers`, and `Blast Drills`.
- **Material Category Filter**: Filter across `All Materials`, `Mineral (Coal/Ore)`, and `Overburden Waste`.
- **Instant Reset**: Dedicated reset button restoring filters to the full simulation window.
- **CSV Data Export**: Direct client-side generation of sanitized CSV operational datasets formatted with ISO timestamps.

### 10.2 Responsive Mobile & Multi-Device Optimization
- **Zero Horizontal Overflow**: Complete eradication of mobile layout bugs via universal `box-sizing: border-box`, dynamic viewport scaling, and responsive table wrappers (`.table-wrap`).
- **Flexible Data Grids**: Auto-collapsing KPI cards (`grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`) preventing layout clipping on mobile screens.
- **Touch-Friendly Controls**: Touch targets optimized to $\ge 44\text{ px}$ with flexible wrapped controls on viewports $< 768\text{ px}$.
- **Theme Support**: Real-time toggling between **Light Mode**, **Dark Mode**, and **System Preference**, persisted via browser `localStorage`.

---

## 11. Data Provenance & Operational Simulation Methodology

### 11.1 Synthetic Operational Telemetry Engine
Because proprietary commercial mine dispatch logs are protected under commercial confidentiality, this project implements a **mathematically rigorous, deterministic operational simulation engine** (`seedSampleData.js`):
- **Deterministic Pseudo-Random Number Generation (PRNG)**: Uses a trigonometric sine hash generator with fixed seed offsets, guaranteeing 100% reproducible operational logs across database seed runs.
- **Temporal Horizon**: Generates 30 days of comprehensive shift logs across 3 shifts per day (90 shifts total).
- **Fleet Scope**: Simulates a balanced open-pit fleet of 16 HEMM units:
  - 3 Hydraulic Excavators / Electric Rope Shovels (`EX-01`, `EX-02`, `EX-03`)
  - 8 Off-Highway Rear Dump Trucks (`DT-01` through `DT-08`)
  - 2 Heavy Crawler Dozers (`DZ-01`, `DZ-02`)
  - 2 Blast-Hole Drill Rigs (`DR-01`, `DR-02`)
  - 1 Motor Grader (`GR-01`)
- **Canonical Production Boundary**: Production tonnage is recorded at the point of dumper delivery/dumping. This design decision strictly prevents double-counting between excavator loading passes and haulage receipts.

### 11.2 Public Reference Benchmarks
Synthetic telemetry is validated and cross-referenced against authentic Indian and international mining norms:
1. **Coal India Limited (CIL) Operational Norms**:
   - Heavy Earthmoving Machinery (HEMM) minimum Mechanical Availability target: $\ge 85\%$.
   - Minimum Operating Utilization norm: $\ge 60\%$.
2. **Directorate General of Mines Safety (DGMS)**:
   - Mechanical failure classification standards and statutory breakdown incident recording norms.
3. **Indian Bureau of Mines (IBM)**:
   - Specific rock strata in-situ densities ($\rho = 1.35\text{ t/m}^3$ for sub-bituminous coal, $\rho = 2.40\text{ t/m}^3$ for sandstone overburden) and swell factors ($S_f = 1.25$ to $1.30$).
4. **SME Mining Engineering Handbook**:
   - Cycle time phase definitions and Shovel–Dumper Match Factor standards.

---

## 12. Deployment Architecture

The application is deployed across production cloud infrastructure:

```
                          Internet Traffic
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
       [Vercel Global CDN]             [Render Cloud Engine]
        React 19 + Vite SPA             Express 5 REST API
    https://btp-xi-ivory.vercel.app/    https://surface-mining-api.onrender.com/api
                 │                               │
                 │ SPA API Calls (CORS Enabled)  │
                 └───────────────────────────────┤
                                                 ▼
                                        [MongoDB Atlas Cloud]
                                      3-Node Replica Set Cluster
```

### 12.1 Frontend Deployment (Vercel)
- **Deployment URL**: [https://btp-xi-ivory.vercel.app/](https://btp-xi-ivory.vercel.app/)
- **Configuration**: Managed via `vercel.json` with SPA catch-all rewrites:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- **Fallback Resilience**: Automatic detection in `api.js` ensures that production builds automatically direct API calls to the live Render backend, preventing accidental `localhost:5000` failures and browser Private Network Access (PNA) blocks.

### 12.2 Backend Deployment (Render)
- **Service URL**: [https://surface-mining-api.onrender.com](https://surface-mining-api.onrender.com)
- **Environment**: Node.js 18+ Web Service.
- **Process Resilience**: Guarded by global `unhandledRejection` and `uncaughtException` process listeners in `server.js` to ensure 99.9% API uptime.
- **CORS Policy**: Configured to accept cross-origin requests from the Vercel production frontend and local development servers.

---

## 13. Local Setup & Installation Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Active local MongoDB daemon or free [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Niranjan05Kumar/BTP.git
cd BTP
```

### 2. Backend Configuration & Startup
Open a terminal in the backend directory:
```bash
cd UGP/backend
```

Create a `.env` file (refer to `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
MONGO_DB_NAME=surface_mining_dashboard
SEED_DAYS=30
SEED_BASE=1337
```

Install dependencies, seed database with synthetic operational data, and start development server:
```bash
npm install
npm run seed       # Deterministically populates MongoDB with 30 days of mining data
npm run dev        # Launches Express API on http://localhost:5000
```

> **Windows PowerShell Note**: If script execution is restricted on your machine, use `npm.cmd` (e.g. `npm.cmd run dev`).

### 3. Frontend Configuration & Startup
In a separate terminal window:
```bash
cd UGP/frontend
```

Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Install dependencies and start the Vite development server:
```bash
npm install
npm run dev        # Serves React dashboard on http://localhost:5173
```

Navigate to `http://localhost:5173` in any modern web browser to access the dashboard.

---

## 14. Repository Directory Structure

```text
BTP/
├── README.md                           # Master Project Documentation & Final Report
├── vercel.json                         # Vercel SPA routing and rewrite rules
├── docs/                               # Engineering & Academic Documentation
│   ├── API_DOCUMENTATION.md            # Comprehensive REST API specifications
│   ├── BACKEND_IMPLEMENTATION.md       # Express controllers & domain service design
│   ├── BACKEND_TEST_REPORT.md          # Backend test matrix & verification results
│   ├── DATABASE_SCHEMA.md              # MongoDB collections & ER relational layout
│   ├── DATA_DICTIONARY.md              # Field-by-field definitions & units
│   ├── DATA_GENERATION_METHODOLOGY.md  # Deterministic PRNG simulation formulation
│   ├── DATA_SOURCE_REGISTER.md         # Regulatory benchmark reference records
│   ├── FEATURE_SPECIFICATION.md        # Functional requirements & business rules
│   ├── FRONTEND_IMPLEMENTATION.md      # React component architecture & state tree
│   ├── FRONTEND_TEST_REPORT.md         # UI viewport responsiveness audit
│   ├── KPI_DEFINITIONS.md              # Mathematical formulas & DGMS/CIL standards
│   └── PROJECT_AUDIT.md                # Production readiness & code audit ledger
└── UGP/
    ├── backend/                        # Express 5 REST API & Mining Services
    │   ├── package.json
    │   ├── src/
    │   │   ├── app.js                  # Express application setup & middleware
    │   │   ├── server.js               # HTTP listener & process crash guards
    │   │   ├── config/
    │   │   │   └── db.js               # Mongoose MongoDB connection manager
    │   │   ├── controllers/
    │   │   │   ├── kpiController.js    # KPI route handler functions
    │   │   │   └── dataController.js   # Master & raw fact data controllers
    │   │   ├── data/
    │   │   │   ├── masterCatalog.js    # Default mine, equipment, material masters
    │   │   │   └── publicBenchmarks.js # CIL, DGMS, IBM statutory reference norms
    │   │   ├── models/                 # 9 Mongoose data schemas
    │   │   │   ├── DataSource.js
    │   │   │   ├── DowntimeEvent.js
    │   │   │   ├── Equipment.js
    │   │   │   ├── HaulageCycleRecord.js
    │   │   │   ├── Material.js
    │   │   │   ├── Mine.js
    │   │   │   ├── MineProductionRecord.js
    │   │   │   ├── ProductionTarget.js
    │   │   │   └── ShiftEquipmentRecord.js
    │   │   ├── routes/
    │   │   │   ├── kpiRoutes.js        # /api/kpi routes
    │   │   │   └── dataRoutes.js       # /api/data routes
    │   │   ├── services/               # 8 Domain analytical calculation services
    │   │   │   ├── downtimeService.js
    │   │   │   ├── equipmentService.js
    │   │   │   ├── fleetMatchingService.js
    │   │   │   ├── fuelCostService.js
    │   │   │   ├── haulageService.js
    │   │   │   ├── insightService.js
    │   │   │   ├── materialService.js
    │   │   │   ├── productionService.js
    │   │   │   ├── queryHelpers.js
    │   │   │   └── reliabilityService.js
    │   │   └── utils/
    │   │       ├── kpiUtils.js         # Math utilities & division safety guards
    │   │       ├── seedSampleData.js   # Deterministic PRNG operational data seeder
    │   │       └── validators.js       # Input parameter sanitizers
    │   └── test/                       # Automated test suites
    │       ├── calculationRules.test.js
    │       ├── dataValidation.test.js
    │       └── simulationIntegrity.test.js
    └── frontend/                       # React 19 + Vite Single Page Application
        ├── package.json
        ├── vite.config.js              # Rollup code splitting & build configuration
        ├── vercel.json                 # Vercel deployment rewrites
        ├── index.html                  # HTML entry point
        └── src/
            ├── App.jsx                 # Client routes & theme provider
            ├── main.jsx                # DOM root mount
            ├── style.css               # Glassmorphism design system & responsive CSS
            ├── components/
            │   ├── Dashboard/          # Specialized chart components
            │   │   ├── DowntimeChart.jsx
            │   │   ├── InsightsPanel.jsx
            │   │   ├── ProductionChart.jsx
            │   │   ├── ShiftProductionChart.jsx
            │   │   ├── SummaryCards.jsx
            │   │   └── UtilizationChart.jsx
            │   ├── Filters/            # Persistent filter bar & controls
            │   │   ├── DateRangeFilter.jsx
            │   │   ├── EquipmentTypeFilter.jsx
            │   │   ├── FiltersBar.jsx
            │   │   ├── MaterialFilter.jsx
            │   │   └── ShiftFilter.jsx
            │   ├── Layout/             # Shell structure (TopNav, SubNav, PageContainer)
            │   └── UI/                 # Reusable UI primitives (GlassCard, KpiCard)
            ├── context/
            │   └── FilterContext.jsx   # Global query filter state manager
            ├── pages/                  # 10 Dedicated analytical dashboard modules
            │   ├── MainDashboard.jsx
            │   ├── ProductionView.jsx
            │   ├── EquipmentView.jsx
            │   ├── DowntimeReliabilityView.jsx
            │   ├── HaulageView.jsx
            │   ├── FleetMatchingView.jsx
            │   ├── MaterialStrippingView.jsx
            │   ├── FuelCostView.jsx
            │   ├── InsightsView.jsx
            │   └── DataManagementView.jsx
            ├── services/
            │   └── api.js              # Centralized Axios client with Render fallback
            └── utils/
                └── exportCsv.js        # CSV report generation utility
```

---

## 15. Automated Testing & Quality Assurance

The backend repository includes an automated verification test suite executed using the native Node.js test runner (`node:test`):

```bash
cd UGP/backend
npm test
```

### Verified Test Matrix (26/26 Tests Passing)
1. **Mechanical Availability & Utilization**:
   - Standard 8-hour shift hour reconciliation ($\text{Op} + \text{Idle} + \text{Maint} = 8\text{ hrs}$).
   - Zero-division safety guards handling zero scheduled hours gracefully without `NaN`.
   - Complete breakdown isolation ensuring maintenance hours do not contaminate operating time.
2. **Shovel–Dumper Match Factor & Passes**:
   - Verification of balanced fleet criteria ($\text{MF} = 1.0 \pm 0.1$).
   - Accurate identification of under-trucked ($\text{MF} < 0.85$) and over-trucked ($\text{MF} > 1.05$) fleets.
   - Excavator loading pass ceiling math ($\lceil \text{Payload} / (\text{BucketVol} \times \text{Density}) \rceil$).
3. **Stripping Ratio Calculations**:
   - Volumetric stripping ratio ($SR_v \text{ in m}^3/\text{t}$) and gravimetric stripping ratio ($SR_m \text{ in t/t}$).
   - Boundary condition testing for zero mineral production shifts.
4. **Reliability Engineering Formulas**:
   - MTBF calculation strictly validating operating hours against qualifying mechanical breakdowns.
   - MTTR calculation ensuring active repair durations exclude scheduled routine preventive maintenance.
5. **Haulage Cycle Decomposition**:
   - Mathematical verification that total cycle time exactly matches the sum of the 5 non-overlapping phases.
6. **Fuel Intensity & Cost Allocations**:
   - Fuel burn per operating hour and specific fuel burn per delivered mineral tonne.
7. **Input Validation & Sanitization**:
   - Validation of ISO date formats, chronological date range enforcement, shift enums (`A`, `B`, `C`), and HEMM type constraints.
8. **Simulation Determinism & Data Reconciliation**:
   - Verifying that identical seeds yield identical operational totals and that shift-hour totals balance across all HEMM classes.

---

## 16. Mining Engineering Significance

From a mineral economics and mining engineering perspective, the analytical tools provided by this dashboard directly impact the primary drivers of open-pit operating expenditures:

1. **Elimination of Truck Bunching & Shovel Starvation**: Haulage typically constitutes **40% to 60%** of total operating costs in an open-pit mine. Using the SME Match Factor analysis, dispatchers can balance truck assignments to shovel loading times, preventing multi-truck queue congestion at loading faces and eliminating shovel idle waiting.
2. **Clear Distinction Between Availability and Utilization**: High mechanical availability ($> 90\%$) does not guarantee profitability if operational utilization is low ($< 50\%$). By tracking **Use of Availability ($UA$)**, management can isolate whether poor performance is an equipment maintenance failure or an operational dispatch deficiency.
3. **Targeted Reliability Engineering**: Calculating MTBF and MTTR on specific equipment subsystems (e.g., hydraulics versus engine components) allows maintenance planners to implement predictive component changeouts before catastrophic in-pit failures occur.
4. **Stripping Ratio Compliance**: Monitoring stripping ratios prevents the mining pit from running into steep highwalls or premature mineral exhaustion by ensuring waste stripping keeps pace with ore extraction according to the long-term mine plan.

---

## 17. Project Context & Academic Framing

This project was developed as an **Undergraduate B.Tech Final Year Capstone Project (BTP)** bridging the domains of **Mining Engineering** and **Computer Science & Engineering**.

### Academic & Technical Contributions
- **Domain-Specific Modeling**: Implementation of authentic mining engineering equations and DGMS compliance standards rather than generic commercial dashboard templates.
- **Enterprise Web Architecture**: Full-stack implementation featuring modern React 19 paradigms, Express 5 modular architecture, and MongoDB aggregation pipelines.
- **Deterministic Data Modeling**: Engineering a transparent, reproducible simulation model that faithfully replicates open-pit mine dynamics while respecting corporate data confidentiality.

---

## 18. Limitations & Scope of Current Version

1. **Simulated Telemetry**: While the telemetry generation model is calibrated against Coal India norms and rock mechanics formulas, the current version consumes deterministically simulated database records rather than live CAN-bus/SCADA IoT streaming hardware.
2. **Deterministic Rules Over Machine Learning**: Operational insights are generated using transparent, rule-based threshold logic. The current version intentionally avoids opaque machine-learning or black-box predictive models to preserve mathematical interpretability for mine safety reviews.
3. **Single Open-Pit Context**: Master data catalogs currently model an open-pit coal operation; adapting to underground extraction or metal/hard-rock mining requires updating grade distribution and bench models.

---

## 19. Future Scope & System Enhancements

1. **Hardware Telemetry Integration**: Integration with in-cab GPS/GNSS dispatch hardware, OEM telemetry gateways (e.g. Caterpillar MineStar, Komatsu Modular DISPATCH), and weighbridge load-cell sensors.
2. **Predictive Failure Analytics**: Training time-to-failure machine learning models (e.g. Weibull survival analysis) on continuous engine oil pressure, hydraulic temperature, and vibration sensor data.
3. **Spatial GIS & Haul Road Mapping**: Integration of WebGL-based 3D terrain and haul road gradient models to visualize real-time truck GPS positions, road rolling resistance, and slope hazards.
4. **Automated Dispatch Optimization**: Developing dynamic linear programming algorithms to automatically reassign haul trucks in real-time to active shovels based on dynamic cycle variations.

---

## 20. References & Standards

1. **SME Mining Engineering Handbook** (3rd Edition), Society for Mining, Metallurgy & Exploration.
2. **Coal India Limited (CIL)**, *Annual Operational & HEMM Performance Norms*, Ministry of Coal, Government of India.
3. **Directorate General of Mines Safety (DGMS)**, *Safety Management & Heavy Earthmoving Machinery Incident Reporting Guidelines*, Dhanbad, India.
4. **Indian Bureau of Mines (IBM)**, *Mineral Conservation & Development Rules (MCDR)*, Nagpur, India.
5. **Hustrulid, W., Kuchta, M., & Martin, R.**, *Open Pit Mine Planning and Design*, CRC Press.

---

## 21. Author & Acknowledgements

- **Student Developer**: Niranjan Kumar
- **Degree**: Bachelor of Technology (B.Tech)
- **Project**: Final Year Capstone Project (BTP)
- **Specialization**: Mining Engineering & Computer Science

*Gratitude is expressed to project faculty guides, departmental advisors, and open-source software maintainers who supported the development and deployment of this project.*
