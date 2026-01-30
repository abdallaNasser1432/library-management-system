const bookRepo = require("../repositories/book.repository");
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
    if (payload.available_quantity != null && payload.available_quantity < 0) {
      throw new BadRequestError("available_quantity must be >= 0");
    }

    if (payload.isbn) {
      const existing = await bookRepo.findByIsbn(payload.isbn);
      if (existing && existing.id !== Number(id)) {
        throw new ConflictError("ISBN already exists");
      }
    }

    const updated = await bookRepo.updateById(id, payload);
    if (!updated) throw new NotFoundError("Book not found");

    return updated;
  }

  async deleteBook(id) {
    const ok = await bookRepo.deleteById(id);
    if (!ok) throw new NotFoundError("Book not found");
    return true;
  }

  async searchBooks(params) {
    return bookRepo.search(params);
  }
}

module.exports = new BookService();