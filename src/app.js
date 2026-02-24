require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const responseMiddleware = require("./middlewares/response.middleware");
const authMiddleware = require("./middlewares/auth.middleware");

const booksRoutes = require("./routes/books.routes");
const borrowersRoutes = require("./routes/borrowers.routes");
const borrowingsRoutes = require("./routes/borrowings.routes");
const reportsRoutes = require("./routes/reports.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.CORS_ORIGIN
    : "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());
app.use(responseMiddleware);

// Health check (using unified template)
app.get("/health", (req, res) => {
  return res.success({ status: "ok" }, "Service is healthy");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/borrowers", borrowersRoutes);
app.use("/api/borrowings", borrowingsRoutes);
app.use("/api/reports", authMiddleware, reportsRoutes);

// 404 handler
app.use((req, res) => {
  return res.fail("Route not found", 404);
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const errors = err.errors || [];

  return res.fail(message, statusCode, errors);
});

module.exports = app;
