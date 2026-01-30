const express = require("express");
const borrowingService = require("../services/borrowing.service");

const router = express.Router();

// Checkout a book
router.post("/checkout", async (req, res, next) => {
  try {
    const result = await borrowingService.checkout(req.body);
    return res.success(result, "Book checked out", 201);
  } catch (err) {
    next(err);
  }
});

// Return a book
router.post("/return", async (req, res, next) => {
  try {
    const result = await borrowingService.returnBook(req.body);
    return res.success(result, "Book returned");
  } catch (err) {
    next(err);
  }
});

// List active borrowed books for a borrower
router.get("/borrowers/:id/active", async (req, res, next) => {
  try {
    const result = await borrowingService.listActiveBorrowingsForBorrower(req.params.id);
    return res.success(result, "Active borrowings fetched");
  } catch (err) {
    next(err);
  }
});

// List overdue borrowings
router.get("/overdue", async (req, res, next) => {
  try {
    const items = await borrowingService.listOverdueBorrowings();
    return res.success(items, "Overdue borrowings fetched");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
