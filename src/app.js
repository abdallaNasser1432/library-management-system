const express = require("express");
const responseMiddleware = require("./middlewares/response.middleware");

const booksRoutes = require("./routes/books.routes");
const borrowersRoutes = require("./routes/borrowers.routes");

const app = express();

app.use(express.json());
app.use(responseMiddleware);


// Health check (using unified template)
app.get("/health", (req, res) => {
  return res.success({ status: "ok" }, "Service is healthy");
});

// API routes
app.use("/api/books", booksRoutes);
app.use("/api/borrowers", borrowersRoutes);

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
