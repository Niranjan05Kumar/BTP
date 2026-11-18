# Project Audit: Surface Mining Dashboard (MERN)

**Project:** Development of a Web-based Production and Equipment Utilization Dashboard for Surface Mining Operations  
**Role:** Senior Full-Stack Engineer, Mining Operations Analyst, Database Architect  
**Audit Date:** November 2026  
**Audited Directory:** `c:\Users\ASUS\Desktop\CODE\BTP`  
**Target Subdirectory:** `UGP/` (Backend & Frontend)

---

## 1. Executive Summary

An exhaustive audit of the existing repository was performed covering both backend and frontend source files, database schemas, API controllers, aggregation utilities, seed scripts, styling, and UI components.

The current application is a functional prototype built on the MERN stack (MongoDB, Express, React, Node.js) with Vite. It demonstrates basic shift-level tracking for 9 equipment units (6 dumpers and 3 shovels) across 21 days of synthetic data. However, the current implementation exhibits critical **mining-engineering calculation flaws** (such as double-counting shovel and dumper tonnage), **hardcoded/random UI metrics** (mocked sparklines and hardcoded trend percentages), **rigid filter boundaries** on secondary pages, and a **narrow domain model** that lacks essential mining analytics: mechanical availability, MTBF/MTTR, haulage cycle-time breakdown, shovel-dumper matching, multi-material stripping ratios, and public benchmark integration.

---

## 2. Source Code & Architecture Inventory

```
BTP/
├── README.md                          # Repository root documentation (recently updated)
├── docs/                              # Phase 1 specification documents
└── UGP/
    ├── project_summary.md             # Initial project scope and notes
    ├── backend/
    │   ├── package.json               # Express 5, Mongoose 9, cors, morgan, dotenv, nodemon
    │   ├── .env / .env.example        # PORT=5000, MONGO_URI, SEED_DAYS=21, SEED_BASE=1337
    │   └── src/
    │       ├── server.js              # Database connection bootstrap & Express listen
    │       ├── app.js                 # Express app config, CORS, JSON, Morgan, Routes, Error Handler
    │       ├── config/db.js           # Mongoose connection logic
    │       ├── models/
    │       │   ├── Equipment.js       # Equipment master model (dumper, shovel, dozer, drill)
    │       │   ├── ProductionTarget.js# Daily target tonnage model
    │       │   └── ShiftEquipmentRecord.js # Shift-level operational fact model
    │       ├── controllers/
    │       │   ├── kpiController.js   # Handlers for KPI summary, production, utilization, downtime
    │       │   └── dataController.js  # Handlers for equipment list, raw records, targets
    │       ├── routes/
    │       │   ├── kpiRoutes.js       # /api/kpi routes
    │       │   └── dataRoutes.js      # /api/data routes
    │       └── utils/
    │           ├── validators.js      # Date range, shift code, equipment type query validators
    │           ├── kpiUtils.js        # MongoDB aggregation pipelines for production & KPIs
    │           └── seedSampleData.js  # 21-day synthetic data generator with deterministic pseudo-random seed
    └── frontend/
        ├── package.json               # React 19, Vite 8, React Router 7, Axios, Recharts 3
        ├── vite.config.js             # Vite configuration
        ├── index.html                 # Single page application entry
        ├── README_UI.md               # UI design notes
        └── src/
            ├── App.jsx                # Theme provider (system/light/dark) & Router configuration
            ├── main.jsx               # React DOM root entry
            ├── style.css              # Custom CSS variables, responsive design, typography
            ├── services/api.js        # Axios instance and API service calls
            ├── pages/
            │   ├── MainDashboard.jsx  # Main analytical dashboard with charts & KPI summary
            │   ├── EquipmentView.jsx  # Equipment utilization ranking table
            │   └── DataView.jsx       # Raw shift-level records table
            └── components/
                ├── Dashboard/         # KPI Cards, Production, Shift, Utilization, Downtime, Insights
                ├── Filters/           # DatePicker, ShiftFilter, EquipmentTypeFilter, FilterBar
                ├── Layout/            # TopNav, PageContainer
                └── UI/                # KpiCard, GlassCard
```

---

## 3. Existing Feature Implementation Audit

| Feature Area | Component / Endpoint | Implemented Status | Verified Behavior & Notes |
| :--- | :--- | :--- | :--- |
| **System Health** | `GET /api/health` | **Fully Implemented** | Returns `{ status: "ok", timestamp }`. |
| **KPI Summary** | `GET /api/kpi/summary` | **Partially Implemented** | Aggregates total production, avg daily production, utilization, downtime hours, downtime %, cost per tonne, plan attainment. Contains calculation flaws. |
| **Daily Production** | `GET /api/kpi/production/daily` | **Fully Implemented** | Daily actual tonnage joined with daily target tonnage from `ProductionTarget`. |
| **Shift Production** | `GET /api/kpi/production/by-shift` | **Fully Implemented** | Aggregates tonnage by shift code (`A`, `B`, `C`). |
| **Equipment Utilization** | `GET /api/kpi/equipment/utilization`| **Partially Implemented** | Calculates `operatingHours / (shifts * 8) * 100`. Does not distinguish scheduled vs available hours; ignores idle time. |
| **Downtime by Reason** | `GET /api/kpi/downtime/by-reason` | **Fully Implemented** | Groups downtime hours by reason string. |
| **Raw Records List** | `GET /api/data/records` | **Partially Implemented** | Fetches records with optional date range and max limit (default 300, max 1000). Does not support shift, equipment type, or pagination metadata. |
| **Equipment List** | `GET /api/data/equipment` | **Fully Implemented** | Returns all equipment master documents sorted by ID. |
| **Production Targets** | `GET /api/data/targets` | **Fully Implemented** | Returns all target documents sorted by date. |
| **Global Filters (UI)** | `FiltersBar.jsx` | **Partially Implemented** | Allows selecting start/end dates, shift, and equipment type. However, filters only affect `MainDashboard`; `EquipmentView` and `DataView` use hardcoded relative date ranges. |
| **Theme Switching** | `App.jsx`, `TopNav.jsx` | **Fully Implemented** | Supports `light`, `dark`, and `system` modes, persisted in `localStorage`. |
| **KPI Cards** | `SummaryCards.jsx`, `KpiCard.jsx` | **Flawed / Mocked** | Trend percentages (+3%, -1%, etc.) are hardcoded. Mini sparkline graphs are randomly generated via `Math.random()`. |
| **Operational Insights** | `InsightsPanel.jsx` | **Partially Implemented** | Renders 3 basic text statements based on threshold checks. Does not perform root-cause or bottleneck analysis. |
| **Data Export** | `FiltersBar.jsx` | **Not Implemented** | "Export" button is presentational with no `onClick` handler. |
| **Synthetic Seed Script** | `seedSampleData.js` | **Partially Implemented** | Deterministic generation covering 21 days for 6 dumpers and 3 shovels. Lacks dozers, drills, support equipment, multi-material handling, cycle-time components, and failure events. |

---

## 4. Incomplete Features, Bugs & Technical Debt

### A. Critical Mining Engineering Calculation Bugs

1. **Double Counting Production Across Fleet:**
   - In `backend/src/utils/kpiUtils.js`:
     ```javascript
     totalProduction: { $sum: "$materialTonnage" }
     ```
   - In mining operations, a shovel digs material and loads it into a dumper; the dumper hauls the material to the crusher, stockyard, or waste dump.
   - In `seedSampleData.js`, tonnage is assigned to **both** shovel records (`trips * shovel.capacityTon`) **and** dumper records (`trips * dumper.capacityTon`).
   - When calculating total mine production without filtering by equipment type, summing both shovel tonnage and dumper tonnage **doubles the actual mine output**!
   - **Resolution:** Clearly designate the primary hauling entity (e.g., dumper delivery) as the mine production measure, or aggregate shovel excavation separately from haulage delivery, and never sum them into one combined figure without clear distinction.

2. **Target Attainment Mismatch under Partial Filtering:**
   - In `getSummaryKPIs`:
     ```javascript
     const planAttainment = totalTarget ? (total.totalProduction / totalTarget) * 100 : 0;
     ```
   - `totalTarget` represents the full 24-hour target across all shifts and all equipment.
   - If a user filters by `shift = 'A'`, `totalProduction` represents only shift A (~33% of the daily total), while `totalTarget` remains the 24-hour unadjusted target, yielding an artificial attainment of ~30-33% even when shift A met 100% of its allocation.
   - Similarly, filtering by equipment type `dumper` or `shovel` cuts production in half against an unadjusted total mine target.
   - **Resolution:** Production targets must be shift-aware or prorated proportionately according to active filter boundaries.

3. **Absence of Standard Availability & Operational Classifications:**
   - The current code models only `operatingHours` and `downtimeHours`, where `operatingHours + downtimeHours = 8`.
   - In standard mining engineering (e.g., AS 4242 / DGMS / CIL guidelines):
     $$\text{Total Time} (8\text{ h}) = \text{Operating Time} + \text{Idle / Operational Delay Time} + \text{Maintenance Downtime}$$
   - Without `idleHours`, **Mechanical Availability** cannot be distinguished from **Operating Utilization**.
   - Planned maintenance and unplanned mechanical breakdowns are lumped together in one general reason string.

4. **Lack of Stripping Ratio & Material Separation:**
   - Real surface mines extract **Mineral/Ore** (e.g., Coal, Iron Ore, Bauxite, Limestone) and strip **Overburden (OB) / Waste Rock**.
   - Stripping ratio ($SR = \text{Overburden} / \text{Ore}$) is the single most vital operational indicator for surface mines. The current schema tracks only a single undifferentiated numeric `materialTonnage`.

5. **Lack of Haulage Cycle-Time Breakdown:**
   - Dumpers only record a scalar `trips` count.
   - The five fundamental phases of a haul cycle (Queue/Waiting, Spot & Loading, Loaded Travel, Dumping, Empty Return) are not modeled. Consequently, haulage bottlenecks, queue delays, and cycle efficiencies cannot be analyzed.

6. **Missing Reliability Metrics (MTBF & MTTR):**
   - No failure event records exist. MTBF and MTTR cannot be computed without distinct tracking of failure occurrences and active repair durations.

### B. Software Engineering & Architecture Issues

1. **Hardcoded and Fake Metrics in UI:**
   - `SummaryCards.jsx` hardcodes trend values (`trend: 3`, `trend: -1`, `trend: 2`, `trend: -12`, `trend: 5`).
   - `SummaryCards.jsx` generates sparklines via `Math.random()`, directly violating analytical integrity.
   - `FiltersBar.jsx` displays hardcoded string `"Live • Updated 2m ago"`.
   - `FiltersBar.jsx` has a dead `"Export"` button.

2. **Disconnected Filtering on Child Pages:**
   - `EquipmentView.jsx` hardcodes `startDate` to 13 days ago and ignores global filters.
   - `DataView.jsx` hardcodes `startDate` to 6 days ago and ignores global filters.
   - Neither page allows user-driven filtering.

3. **Missing Automated Testing:**
   - `backend/package.json` test script only runs `node --check` (syntax checking only). No unit tests exist for KPI calculations.
   - `frontend/package.json` test script merely echoes a console log string.

4. **Absence of Pagination & Data Guardrails:**
   - `listRawRecords` in `dataController.js` returns up to 1000 documents without total count, page index, or offset metadata.

5. **Sandbox & Windows Git Permissions:**
   - Standard sandbox mode denies write operations on `.git/`, requiring elevated commands for git commits and pushes.

---

## 5. Summary Audit Matrix

| Metric / Capability | Current Status | Required Target State |
| :--- | :--- | :--- |
| **Equipment Fleet** | 9 units (6 dumpers, 3 shovels) | Configurable fleet: Shovels, Dumpers, Dozers, Drills, Wheel Loaders, Graders, Water Tankers |
| **Material Master** | None (single `materialTonnage`) | Database-driven Material collection (Coal, Iron Ore, Bauxite, Limestone, Overburden, Waste, etc.) |
| **Stripping Ratio** | None | Computed volumetric ($\text{m}^3/\text{t}$) and gravimetric ($\text{t}/\text{t}$) ratios |
| **Mechanical Availability** | None | Separate Scheduled, Maintenance, Operating, and Idle hours |
| **Haulage Cycles** | Scalar `trips` only | Complete 5-phase cycle model with cycle time & queue analysis |
| **Fleet Matching** | None | Match factor, pass counts, bucket capacity, shovel-dumper sync |
| **Reliability** | None | Event-driven MTBF and MTTR based on qualifying breakdowns |
| **Public Benchmarks** | None | CIL / IBM / Ministry of Coal reference data register |
| **Frontend Modules** | 3 pages (Dashboard, Equipment, Data) | 12 comprehensive analytical modules/views |
| **Export Facility** | Dead button | Functional CSV export for analytical tables |

---

*Verified against source code in `c:\Users\ASUS\Desktop\CODE\BTP\UGP`.*

