import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

const startServer = async () => {
  console.log(`Starting Surface Mining API on port ${PORT}...`);
  await connectDB();

  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
  });
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

startServer().catch((error) => {
  console.error("FATAL: Failed to start server:", error.message || error);
  setTimeout(() => {
    process.exit(1);
  }, 300);
});
