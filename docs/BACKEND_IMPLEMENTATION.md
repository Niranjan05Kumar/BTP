# Backend Implementation Architecture Report

**Project:** Development of a Web-based Production and Equipment Utilization Dashboard for Surface Mining Operations  
**Document Version:** 2.0  
**Phase:** Phase 2 — Backend Development & Advanced Data Processing  
**Status:** Completed & Tested  

---

## 1. Architectural Architecture & Directory Layout

The Phase 2 backend architecture is structured around modular, domain-driven services that separate HTTP routing and serialization from database queries and mathematical aggregation.

```
UGP/backend/
├── package.json                   # Express 5, Mongoose 9, Node test runner configured
├── src/
│   ├── server.js                  # Database connection bootstrap & Express listen
│   ├── app.js                     # Express setup, middleware, routing, and centralized error handler
│   ├── config/
│   │   └── db.js                  # Mongoose MongoDB connection client
│   ├── data/
│   │   ├── masterCatalog.js       # Verified 16-unit fleet, default mine, physical materials catalog
│   │   └── publicBenchmarks.js    # Official public benchmark data from CIL, IBM, and DGMS
│   ├── models/
│   │   ├── Mine.js                # Mine master entity
│   │   ├── Material.js            # Rock strata & physical density properties
│   │   ├── Equipment.js           # HEMM fleet master with capacity, bucket volume, engine power
│   │   ├── DataSource.js          # Provenance metadata (public benchmark vs synthetic)
│   │   ├── ShiftEquipmentRecord.js# Fact collection: 8-hr shift logs (reconciles To + Ti + Tm = 8h)
│   │   ├── ProductionTarget.js    # Budgeted targets by date, shift, and material
│   │   ├── HaulageCycleRecord.js  # Granular dumper cycle events (tw + tl + th + td + tr = Tc)
│   │   ├── DowntimeEvent.js       # Discrete equipment stoppage & breakdown events
│   │   └── MineProductionRecord.js# Public sector reference benchmarks (CIL, IBM, DGMS)
│   ├── services/
│   │   ├── queryHelpers.js        # ISO date bounding, range matching, and multi-field filters
│   │   ├── productionService.js   # Daily, shift, material production (double-counting prevention)
│   │   ├── equipmentService.js    # Mechanical Availability, Operating Utilization, Use of Availability
│   │   ├── downtimeService.js     # Pareto downtime breakdown by reason, category, subsystem
│   │   ├── haulageService.js      # 5-phase haulage cycle dynamics & queue delay analysis
│   │   ├── fleetMatchingService.js# Shovel-dumper Match Factor (MF) and bucket pass compatibility
│   │   ├── materialService.js     # Volumetric (m³/t) and Gravimetric (t/t) stripping ratios
│   │   ├── fuelCostService.js     # Specific fuel burn (L/t, L/h) and operating cost per tonne
│   │   ├── reliabilityService.js  # MTBF and MTTR calculations strictly using qualifying breakdowns
│   │   └── insightService.js      # Explainable, rule-based heuristic bottleneck detection
│   ├── controllers/
│   │   ├── kpiController.js       # 16 KPI analytics request handlers with parameter validation
│   │   └── dataController.js      # Master lists, raw logs, paginated haulage cycles, targets
│   ├── routes/
│   │   ├── kpiRoutes.js           # /api/kpi routes (summary, production, fleet, matching, reliability...)
│   │   └── dataRoutes.js          # /api/data routes (equipment, raw records, cycles, benchmarks...)
│   └── utils/
│       ├── validators.js          # Query parameter validators (date ranges, shifts, 8 equipment types)
│       ├── kpiUtils.js            # Unified backward-compatible KPI utilities
│       └── seedSampleData.js      # Deterministic 30-day synthetic generator with physics consistency
└── test/
    ├── calculationRules.test.js   # Pure unit tests for all 15 mining engineering formulas
    ├── dataValidation.test.js     # Parameter validator edge-case tests
    └── simulationIntegrity.test.js# Fleet count (16), hour reconciliation, and cycle composition tests
```

---

## 2. Core Mining Engineering Fixes Implemented

### A. Canonical Mine Production Boundary (Double-Counting Prevention)
- **Problem in Prototype:** Prototype aggregated `materialTonnage` across both loading excavators and hauling dumpers, artificially doubling mine output.
- **Implemented Fix:** In `productionService.js` and `kpiUtils.js`, canonical mine output is strictly defined as **Dumper Delivered Tonnage** (`equipmentType: 'dumper'`). Shovel loading output is classified as excavation face production and isolated from net mine extraction.

### B. Shift-Level Target Attainment Proration
- **Problem in Prototype:** Filtering by shift A compared 8 hours of production to an unadjusted 24-hour target, producing false ~33% attainment.
- **Implemented Fix:** The engine checks for an explicit shift-level target in `ProductionTarget` matching the active shift code (`A`, `B`, or `C`). If only a daily 24-hour target exists, it automatically applies the documented shift weight ($w_s = 1/3$).

### C. True Availability Separation ($T_o + T_i + T_m = 8.0\text{ h}$)
- **Implemented Fix:** Added `idleHours` ($T_i$) and `maintenanceHours` ($T_m$) to `ShiftEquipmentRecord`. Every single shift fact reconciles to scheduled shift time ($8.00\text{ h}$).
- **Formulas Implemented:**
  - Mechanical Availability: $MA = \frac{T_s - T_m}{T_s} \times 100$
  - Operating Utilization: $OU = \frac{T_o}{T_s} \times 100$
  - Use of Availability: $UA = \frac{T_o}{T_s - T_m} \times 100$

### D. Multi-Material Stripping Ratio Calculations
- **Implemented Fix:** Database-driven `Material` catalog with in-situ densities ($\rho_{\text{in-situ}}$) and swell factors ($SF$).
- **Calculations:**
  - Volumetric Stripping Ratio: $SR_v = \frac{\text{OB Volume (BCM)}}{\text{Mineral Tonnage (t)}} \quad [\text{m}^3/\text{t}]$
  - Gravimetric Stripping Ratio: $SR_m = \frac{\text{OB Mass (t)}}{\text{Mineral Mass (t)}} \quad [\text{t/t}]$

### E. Shovel-Dumper Match Factor ($MF$)
- **Implemented Fix:** `fleetMatchingService.js` calculates:
  $$MF = \frac{N_d \times t_l}{N_s \times T_c}$$
  Diagnoses under-trucked ($MF < 0.85$), balanced ($0.85 \le MF \le 1.05$), and over-trucked ($MF > 1.05$) fleets.

### F. Event-Driven Reliability (MTBF & MTTR)
- **Implemented Fix:** Dedicated `DowntimeEvent` collection. $N_f$ counts only events where `isFailure === true` and `category === 'Unplanned Breakdown'`. Planned maintenance and operational delays are strictly excluded.
  $$MTBF = \frac{\sum T_o}{N_f} \quad \text{and} \quad MTTR = \frac{\sum T_{\text{repair}}}{N_f}$$

---

## 3. Verified 16-Unit Equipment Fleet

The fleet size has been verified and documented at exactly 16 units across 7 functional HEMM categories:
1. **Shovels / Excavators (3 units):** `SH-01` (12 m³ Face Shovel), `SH-02` (8.5 m³ Excavator), `SH-03` (6.5 m³ Excavator).
2. **Wheel Loader (1 unit):** `WL-01` (5.5 m³ Loader).
3. **Dumpers / Haul Trucks (7 units):** `DT-101` (60t), `DT-102` (60t), `DT-103` (55t), `DT-104` (55t), `DT-105` (50t), `DT-106` (50t), `DT-107` (50t).
4. **Heavy Bulldozers (2 units):** `DZ-01` (410 HP Komatsu D375A), `DZ-02` (350 HP CAT D8T).
5. **Rotary Blast-Hole Drill (1 unit):** `DR-01` (250mm Epiroc PV-271).
6. **Motor Grader (1 unit):** `MG-01` (16 ft CAT 16M3).
7. **Water Tanker (1 unit):** `WT-01` (28,000L BEML WT28).

---

*Phase 2 Backend Implementation verified with zero compilation errors and passing automated test suite.*

