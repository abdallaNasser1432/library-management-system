const bookRepo = require("../repositories/book.repository");
const borrowingRepo = require("../repositories/borrowing.repository");

const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require("../utils/errors");

class BookService {
  async createBook(payload) {
    if (!payload.title || !payload.author || !payload.isbn || !payload.shelf_location) {
      throw new BadRequestError("Missing required fields");
    }

    if (payload.available_quantity != null && payload.available_quantity < 0) {
      throw new BadRequestError("available_quantity must be >= 0");
    }

    const existing = await bookRepo.findByIsbn(payload.isbn);
    if (existing) throw new ConflictError("ISBN already exists");

    return bookRepo.create(payload);
  }

  async getBookById(id) {
    const book = await bookRepo.findById(id);
    if (!book) throw new NotFoundError("Book not found");
    return book;
  }

  async listBooks(params) {
    return bookRepo.list(params);
  }

async updateBook(id, payload) {
  // validate id
  const bookId = Number(id);
  if (!Number.isInteger(bookId) || bookId <= 0) {
    throw new BadRequestError("Invalid book id");
  }

  // title validation
  if ("title" in payload && String(payload.title).trim() === "") {
    throw new BadRequestError("title cannot be empty");
  }

  // author validation
  if ("author" in payload && String(payload.author).trim() === "") {
    throw new BadRequestError("author cannot be empty");
  }

  // isbn validation
  if ("isbn" in payload) {
    const isbn = String(payload.isbn).trim();
    if (isbn === "") {
      throw new BadRequestError("isbn cannot be empty");
    }

    const existing = await bookRepo.findByIsbn(isbn);
    if (existing && existing.id !== bookId) {
      throw new ConflictError("ISBN already exists");
    }

    // normalize
    payload.isbn = isbn;
  }

  // available_quantity validation
  if ("available_quantity" in payload) {
    const qty = Number(payload.available_quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      throw new BadRequestError("available_quantity must be a non-negative integer");
    }

    payload.available_quantity = qty;
  }

  const updated = await bookRepo.updateById(bookId, payload);
  if (!updated) throw new NotFoundError("Book not found");

  return updated;
}


  async deleteBook(id) {
    const bookId = Number(id);
    if (!Number.isInteger(bookId) || bookId <= 0) {
      throw new BadRequestError("Invalid book id");
    }

    // check if book has  borrowings
    const active = await borrowingRepo.hasActiveByBookId(bookId);

    if (active) {
      throw new BadRequestError("Book has active borrowings");
    }

    const deleted = await bookRepo.deleteById(bookId);
    if (!deleted) throw new NotFoundError("Book not found");

    return true;
  }

  async searchBooks(params) {
    return bookRepo.search(params);
  }
}

module.exports = new BookService();