import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import kpiRoutes from "./routes/kpiRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api", (req, res) => {
  res.json({
    message: "Surface Mining Dashboard API",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/kpi", kpiRoutes);
app.use("/api/data", dataRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;
