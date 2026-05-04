# Surface Mining Dashboard (MERN)

## Project Objective

Build a full-stack **MERN** web application for a surface mine that tracks and visualizes:
- Daily and shift-wise production
- Equipment utilization
- Downtime and downtime reasons
- Optional cost-per-tonne metrics

The system uses **synthetic shift-level data** and provides KPI insights through charts and tables.

## Technology Stack

- **Frontend:** React (with Recharts or Chart.js)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas or local)
- **State management:** React hooks (Redux not required for this scope)

## Domain Model (Core Data Entities)

1. **Equipment**
   - `equipmentId` (unique)
   - `type` (`dumper`, `shovel`, optional `dozer`, `drill`)
   - `capacityTon`, optional notes/status

2. **ShiftEquipmentRecord** (main fact collection)
   - `date`, `shiftCode` (`A`, `B`, `C`)
   - `equipmentId`, `equipmentType`
   - `materialTonnage`, `trips`
   - `operatingHours`, `downtimeHours`, `downtimeReason`
   - Optional: `fuelLiters`, `operatingCost`

3. **ProductionTarget** (optional but recommended)
   - `date`, `targetTonnage`

## KPI Definitions

1. **Production**
   - Shift production = sum of `materialTonnage` for date+shift
   - Daily production = sum of all shifts for a date
   - Plan attainment (%) = `(actual / target) * 100`

2. **Utilization**
   - Utilization (%) = `(operatingHours / availableShiftHours) * 100`
   - For date ranges: `sum(operatingHours) / (shiftHours * numberOfShifts)` * 100

3. **Downtime**
   - Downtime hours = sum of `downtimeHours`
   - Downtime (%) = `downtimeHours / (operatingHours + downtimeHours) * 100`
   - Downtime by reason = grouped sum by `downtimeReason`

4. **Optional Cost KPI**
   - Cost per tonne = `sum(operatingCost) / sum(materialTonnage)`

## Suggested Project Structure

```text
project-root/
  backend/
    src/
      models/
        Equipment.js
        ShiftEquipmentRecord.js
        ProductionTarget.js
      controllers/
        kpiController.js
        dataController.js
      routes/
        kpiRoutes.js
        dataRoutes.js
      utils/
        kpiUtils.js
        seedSampleData.js
      config/
        db.js
      app.js
      server.js
    package.json

  frontend/
    src/
      components/
        Dashboard/
          SummaryCards.jsx
          ProductionChart.jsx
          ShiftProductionChart.jsx
          UtilizationChart.jsx
          DowntimeChart.jsx
        Filters/
          DateRangeFilter.jsx
          ShiftFilter.jsx
          EquipmentTypeFilter.jsx
        Layout/
          Navbar.jsx
          PageContainer.jsx
      pages/
        MainDashboard.jsx
        EquipmentView.jsx
        DataView.jsx
      services/
        api.js
      App.jsx
      index.js
    package.json
  README.md
```

## Required Backend APIs

1. `GET /api/kpi/summary?start=YYYY-MM-DD&end=YYYY-MM-DD`
   - Returns total production, average daily production, average utilization, total downtime, top downtime reasons.

2. `GET /api/kpi/production/daily?start=...&end=...`
   - Returns daily `{ date, actual, target }`.

3. `GET /api/kpi/production/by-shift?date=YYYY-MM-DD`
   - Returns shift-wise production.

4. `GET /api/kpi/equipment/utilization?start=...&end=...&type=dumper|shovel|all`
   - Returns per-equipment utilization list.

5. `GET /api/kpi/downtime/by-reason?start=...&end=...`
   - Returns downtime grouped by reason.

6. Optional raw/seed endpoints in `dataRoutes.js`.

## KPI Utility Logic (Backend)

Implement aggregation utilities (Mongo pipelines preferred: `$match`, `$group`, `$project`, optional lookup):
- `getDailyProduction(start, end)`
- `getDailyProductionWithTarget(start, end)`
- `getShiftProduction(date)`
- `getEquipmentUtilization(start, end, type)`
- `getDowntimeByReason(start, end)`
- `getSummaryKPIs(start, end)`

## Frontend Requirements

1. **Global filters**
   - `startDate`, `endDate`, `shift`, `equipmentType`
   - Trigger data refetch on change via `useEffect`

2. **Main dashboard**
   - Summary cards (4-5 KPIs)
   - Daily production vs target chart
   - Shift production chart
   - Utilization chart (per equipment)
   - Downtime chart (pie/bar by reason)

3. **Additional pages (optional)**
   - `EquipmentView`: table + utilization color coding
   - `DataView`: raw record table for validation/debugging

## Frontend API Service Pattern

Use a central API helper (e.g., `frontend/src/services/api.js`) with axios base URL:
- `/kpi/summary`
- `/kpi/production/daily`
- `/kpi/production/by-shift`
- `/kpi/equipment/utilization`
- `/kpi/downtime/by-reason`

## Synthetic Data Generation Requirements

Generate realistic records for 14-30 days:
- 3 shifts/day (`A`, `B`, `C`), each 8 hours
- Equipment set (e.g., D1-D6 dumpers, S1-S3 shovels)
- Daily target around 10,000-15,000 tonnes
- Utilization typically 60-85%
- Downtime roughly 10-25% with reason patterns
- Insert both `ShiftEquipmentRecord` and `ProductionTarget` documents

## Non-Functional Requirements

- Modular code separation (models, KPI logic, routes, UI components)
- Use `.env` for DB URI, ports, and config
- Local demo-ready performance for thousands of records
- Clear documentation and setup instructions

## Deliverables

1. Backend code (models, seed script, KPI functions, REST APIs)
2. Database schema/data setup (Mongo collections and sample data)
3. Frontend dashboard with charts, filters, and tables
4. README + API docs + KPI formula explanation
