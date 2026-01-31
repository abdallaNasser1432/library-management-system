const express = require("express");
const borrowerService = require("../services/borrower.service");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

const parsePagination = (req) => {
  const limitRaw = Number(req.query.limit);
  const offsetRaw = Number(req.query.offset);

  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 10;
  const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

  return { limit, offset };
};

// Create borrower
router.post("/",authMiddleware, async (req, res, next) => {
  try {
    const borrower = await borrowerService.createBorrower(req.body);
    return res.success(borrower, "Borrower registered", 201);
  } catch (err) {
    next(err);
  }
});

// List borrowers
router.get("/", async (req, res, next) => {
  try {
    const { limit, offset } = parsePagination(req);
    const borrowers = await borrowerService.listBorrowers({ limit, offset });
    return res.success(borrowers, "Borrowers fetched");
  } catch (err) {
    next(err);
  }
});

// Get borrower by id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const borrower = await borrowerService.getBorrowerById(id);
    return res.success(borrower, "Borrower fetched");
  } catch (err) {
    next(err);
  }
});

// Update borrower
router.put("/:id",authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await borrowerService.updateBorrower(id, req.body);
    return res.success(updated, "Borrower updated");
  } catch (err) {
    next(err);
  }
});

// Delete borrower
router.delete("/:id",authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await borrowerService.deleteBorrower(id);
    return res.success(null, "Borrower deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
