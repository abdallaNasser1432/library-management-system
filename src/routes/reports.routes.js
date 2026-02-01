const express = require("express");
const reportService = require("../services/report.service");
const { reportsLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();


// Summary analytics
router.get("/borrowings/summary", async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const summary = await reportService.borrowingsSummary({ from, to });
    return res.success(summary, "Report generated");
  } catch (err) {
    next(err);
  }
});

// Export borrowings by period: json/csv/xlsx
router.get("/borrowings/export",reportsLimiter, async (req, res, next) => {
  try {
    const { from, to, format = "json" } = req.query;

    const rows = await reportService.borrowingsExport({ from, to });

    if (format === "csv") {
      const csv = reportService.toCsv(rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="borrowings.csv"');
      return res.status(200).send(csv);
    }

    if (format === "xlsx") {
      const buffer = await reportService.toXlsxBuffer(rows);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", 'attachment; filename="borrowings.xlsx"');
      return res.status(200).send(Buffer.from(buffer));
    }

    return res.success(rows, "Export data fetched");
  } catch (err) {
    next(err);
  }
});

// Bonus #2: overdue last month export
router.get("/borrowings/overdue-last-month/export",reportsLimiter, async (req, res, next) => {
  try {
    const { format = "csv" } = req.query;
    const rows = await reportService.overdueLastMonthExport();

    if (format === "xlsx") {
      const buffer = await reportService.toXlsxBuffer(rows);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", 'attachment; filename="overdue-last-month.xlsx"');
      return res.status(200).send(Buffer.from(buffer));
    }

    const csv = reportService.toCsv(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="overdue-last-month.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
});

// Bonus #3: all borrowings last month export
router.get("/borrowings/last-month/export",reportsLimiter, async (req, res, next) => {
  try {
    const { format = "csv" } = req.query;
    const rows = await reportService.allBorrowingsLastMonthExport();

    if (format === "xlsx") {
      const buffer = await reportService.toXlsxBuffer(rows);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", 'attachment; filename="borrowings-last-month.xlsx"');
      return res.status(200).send(Buffer.from(buffer));
    }

    const csv = reportService.toCsv(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="borrowings-last-month.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
