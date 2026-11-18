# API Documentation: Surface Mining Dashboard

**Project:** Development of a Web-based Production and Equipment Utilization Dashboard for Surface Mining Operations  
**Document Version:** 2.0  
**Phase:** Phase 2 — API Specification  

---

## 1. Global API Standards

- **Base URL:** `http://localhost:5000/api`
- **Transport:** JSON over HTTP/REST
- **Global Query Parameters:**
  - `start` (required, format: `YYYY-MM-DD`): Beginning of calendar analysis window.
  - `end` (required, format: `YYYY-MM-DD`): End of calendar analysis window.
  - `shift` (optional, default: `all`): Shift code filter (`all`, `A`, `B`, `C`).
  - `type` (optional, default: `all`): Equipment type (`all`, `dumper`, `shovel`, `wheel_loader`, `dozer`, `drill`, `motor_grader`, `water_tanker`).
  - `material` (optional, default: `all`): Material category (`all`, `Ore`, `Mineral`, `Overburden`, `Waste`, `Topsoil`).
  - `equipmentId` (optional, default: `all`): Target machine asset tag (e.g. `DT-101`, `SH-01`).

---

## 2. API Endpoints Directory

### 2.1 System & Health Routes

#### `GET /api`
Returns API metadata and service links.
- **Response (200 OK):**
  ```json
  {
    "message": "Surface Mining Dashboard API",
    "health": "/api/health"
  }
  ```

#### `GET /api/health`
Returns live system health status and current ISO timestamp.
- **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-11-04T10:30:00.000Z"
  }
  ```

---

### 2.2 Analytical & KPI Routes (`/api/kpi`)

#### `GET /api/kpi/summary`
Returns high-level executive dashboard metrics across the selected filter window.
- **Query Parameters:** `start`, `end`, `shift`, `type`
- **Response (200 OK):**
  ```json
  {
    "totalProduction": 182450.60,
    "averageDailyProduction": 6081.69,
    "averageUtilization": 69.45,
    "mechanicalAvailability": 83.12,
    "totalDowntimeHours": 486.20,
    "totalOperatingHours": 2000.16,
    "totalIdleHours": 393.64,
    "downtimePercent": 16.88,
    "costPerTonne": 51.40,
    "planAttainment": 98.42,
    "totalTarget": 185380.00,
    "topDowntimeReasons": [
      { "reason": "High-Pressure Hose Burst", "downtimeHours": 64.20, "eventCount": 22 },
      { "reason": "Scheduled 250-Hour PM Service", "downtimeHours": 58.00, "eventCount": 29 }
    ]
  }
  ```

#### `GET /api/kpi/production/daily`
Returns daily actual extraction versus target with variance and attainment percentages.
- **Response (200 OK):**
  ```json
  [
    {
      "date": "2026-10-01",
      "actual": 6240.50,
      "target": 6100.00,
      "variance": 140.50,
      "attainment": 102.30
    }
  ]
  ```

#### `GET /api/kpi/production/by-shift`
Returns production tonnage, volume in BCM, and trips grouped by shifts `A`, `B`, and `C`.

#### `GET /api/kpi/production/by-material`
Returns extracted quantities partitioned by material code and category (e.g. `COAL_ROM`, `OB_SANDSTONE`, `OB_SHALE`).

#### `GET /api/kpi/equipment/utilization`
Returns ranking of equipment with operating hours, idle hours, maintenance hours, mechanical availability ($MA$), utilization ($OU$), use of availability ($UA$), and productivity (t/hr).
- **Response (200 OK):**
  ```json
  [
    {
      "equipmentId": "SH-01",
      "equipmentType": "shovel",
      "operatingHours": 188.50,
      "idleHours": 36.20,
      "maintenanceHours": 15.30,
      "scheduledHours": 240,
      "mechanicalAvailability": 93.63,
      "utilization": 78.54,
      "useOfAvailability": 83.89,
      "productivityTonPerHour": 682.40,
      "shifts": 30
    }
  ]
  ```

#### `GET /api/kpi/equipment/summary`
Returns aggregate hours and fleet-wide availability and utilization percentages.

#### `GET /api/kpi/downtime/by-reason`
Returns grouped downtime hours and event counts sorted by impact.

#### `GET /api/kpi/downtime/by-category`
Returns grouped hours by category: `Planned Maintenance`, `Unplanned Breakdown`, `Operational Delay`.

#### `GET /api/kpi/downtime/by-subsystem`
Returns grouped hours by mechanical/operational subsystem (`Hydraulics`, `Engine`, `Transmission`, `Electrical`, `Tires & Tracks`, `Structural`, `Weather`).

#### `GET /api/kpi/haulage/summary`
Returns aggregate haulage kinematic cycle analysis: total trips, average payload, average cycle minutes, and the 5 non-overlapping phases:
- `queueWaitMinutes`
- `spotLoadMinutes`
- `loadedTravelMinutes`
- `spotDumpMinutes`
- `emptyReturnMinutes`
- `queueContributionPercent`
- `dumperHourlyProductivity`

#### `GET /api/kpi/haulage/by-dumper`
Returns dumper-level cycle times, average payload, trips, and queue delay percentages.

#### `GET /api/kpi/fleet/matching`
Returns Shovel-Dumper Match Factor ($MF$), bucket pass counts, active assigned dumpers, and operational diagnostic status (`Balanced`, `Under-Trucked`, `Over-Trucked`).

#### `GET /api/kpi/materials/stripping-ratio`
Returns mineral tonnage, overburden volume (BCM), Volumetric Stripping Ratio ($SR_v$ in $\text{m}^3/\text{t}$), Gravimetric Stripping Ratio ($SR_m$ in $\text{t/t}$), and daily trend series.

#### `GET /api/kpi/fuel/summary`
Returns total diesel liters, specific consumption per operating hour (L/h), consumption per tonne (L/t), specific operating cost per tonne (₹/t), and equipment breakdown.

#### `GET /api/kpi/reliability/metrics`
Returns fleet and equipment-level MTBF, MTTR, qualifying failure counts, active repair hours, failure frequency per 100 operating hours, and subsystem Pareto.

#### `GET /api/kpi/insights`
Returns explainable, rule-based operational bottleneck diagnostic cards with severity (`critical`, `warning`, `positive`) and recommendations.

---

### 2.3 Master & Operational Data Routes (`/api/data`)

#### `GET /api/data/mines`
Returns list of configured mine sites.

#### `GET /api/data/materials`
Returns database-driven material catalog with in-situ densities and swell factors.

#### `GET /api/data/equipment`
Returns list of all 16 HEMM fleet units with technical specifications.

#### `GET /api/data/sources`
Returns register of data sources and provenance classifications.

#### `GET /api/data/benchmarks`
Returns public reference benchmark records from Coal India Limited, IBM, and DGMS.

#### `GET /api/data/records`
Paginated search for shift-equipment fact records.
- **Query Parameters:** `start`, `end`, `shift`, `type`, `equipmentId`, `materialCategory`, `page` (default 1), `limit` (default 100, max 1000).
- **Response (200 OK):**
  ```json
  {
    "total": 1440,
    "page": 1,
    "limit": 100,
    "totalPages": 15,
    "records": [...]
  }
  ```

#### `GET /api/data/cycles`
Paginated search for granular haulage cycle trip records.

#### `GET /api/data/downtime-events`
List of discrete equipment stoppage and breakdown events with repair hours and failure flags.

#### `GET /api/data/targets`
List of all shift-level and daily production targets.

---

## 3. Centralized Error Handling

All controller errors are passed to Express error handling middleware:
- **HTTP 400 Bad Request:** Missing or invalid query parameters (e.g. invalid date formats, inverted date ranges, unrecognized shift codes or equipment types).
- **HTTP 500 Internal Server Error:** Unexpected database or runtime exceptions.
- **Format:**
  ```json
  {
    "message": "Specific error explanation"
  }
  ```

