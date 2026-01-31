const express = require("express");
const bookService = require("../services/book.service");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

const parsePagination = (req) => {
  const limitRaw = Number(req.query.limit);
  const offsetRaw = Number(req.query.offset);

  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 10;
  const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

  return { limit, offset };
};

// Create book
router.post("/",authMiddleware, async (req, res, next) => {
  try {
    const book = await bookService.createBook(req.body);
    return res.success(book, "Book created", 201);
  } catch (err) {
    next(err);
  }
});

// List books
router.get("/", async (req, res, next) => {
  try {

    const { limit, offset } = parsePagination(req);
    const books = await bookService.listBooks({ limit, offset });
    return res.success(books, "Books fetched");
  } catch (err) {
    next(err);
  }
});

// Search books
router.get("/search", async (req, res, next) => {
  try {
    const { title, author, isbn } = req.query;
    const { limit, offset } = parsePagination(req);

    const results = await bookService.searchBooks({ title, author, isbn, limit, offset });
    return res.success(results, "Search results fetched");
  } catch (err) {
    next(err);
  }
});

// Get book by id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const book = await bookService.getBookById(id);
    return res.success(book, "Book fetched");
  } catch (err) {
    next(err);
  }
});

// Update book
router.put("/:id",authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await bookService.updateBook(id, req.body);
    return res.success(updated, "Book updated");
  } catch (err) {
    next(err);
  }
});

// Delete book
router.delete("/:id",authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await bookService.deleteBook(id);
    return res.success(null, "Book deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
