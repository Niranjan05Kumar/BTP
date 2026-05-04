# Surface Mining Dashboard (MERN)

A full-stack MERN dashboard for synthetic surface mine operations data. The app tracks production, utilization, and downtime KPIs by shift, date range, and equipment type.

## Tech Stack
- Frontend: React + Vite + Recharts
- Backend: Node.js + Express + Mongoose
- Database: MongoDB

## Project Structure
- `backend` - API, models, KPI aggregation logic, seed scripts
- `frontend` - Dashboard UI, filters, charts, table views

## Backend Setup
1. `cd backend`
2. `cp .env.example .env` (or create `.env` manually)
3. Update `MONGO_URI` if required.
4. Install dependencies: `npm install`
5. Seed data: `npm run seed:drop`
6. Start API: `npm run dev`

Backend runs at `http://localhost:5000`.

## Frontend Setup
1. `cd frontend`
2. `cp .env.example .env`
3. Install dependencies: `npm install`
4. Start app: `npm run dev`

Frontend runs at `http://localhost:5173`.

## KPI Endpoints
- `GET /api/kpi/summary?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /api/kpi/production/daily?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /api/kpi/production/by-shift?start=YYYY-MM-DD&end=YYYY-MM-DD&shift=A|B|C|all&type=dumper|shovel|dozer|drill|all`
- `GET /api/kpi/equipment/utilization?start=YYYY-MM-DD&end=YYYY-MM-DD&type=dumper|shovel|dozer|drill|all`
- `GET /api/kpi/downtime/by-reason?start=YYYY-MM-DD&end=YYYY-MM-DD`

Raw data endpoints:
- `GET /api/data/equipment`
- `GET /api/data/records?start=YYYY-MM-DD&end=YYYY-MM-DD&limit=500`
- `GET /api/data/targets`

## KPI Formula Reference
- Shift production = sum of `materialTonnage` for date + shift
- Daily production = sum of all shifts on date
- Utilization (%) = `operatingHours / (operatingHours + downtimeHours) * 100`
- Downtime (%) = `downtimeHours / (operatingHours + downtimeHours) * 100`
- Plan attainment (%) = `totalProduction / totalTarget * 100`
- Cost per tonne = `sum(operatingCost) / sum(materialTonnage)`

## Notes
- Data is synthetic and generated for `SEED_DAYS` days (default 21).
- Each day includes 3 shifts (`A`, `B`, `C`) and seeded equipment fleets.
- All implementation is JavaScript/JSX (no TypeScript).
