const db = require("../db/knex");

const bookRepo = require("../repositories/book.repository");
const borrowerRepo = require("../repositories/borrower.repository");
const borrowingRepo = require("../repositories/borrowing.repository");

const { BadRequestError, NotFoundError } = require("../utils/errors");

class BorrowingService {
  async checkout(payload) {
    const bookId = Number(payload.book_id);
    const borrowerId = Number(payload.borrower_id);
    const dueDateRaw = payload.due_date;
    const borrowedAtRaw = payload.borrowed_at; // optional

    if (!bookId || !borrowerId || !dueDateRaw) {
      throw new BadRequestError("Missing required fields");
    }

    // Validate dates
    const dueDate = new Date(dueDateRaw);
    if (Number.isNaN(dueDate.getTime())) {
      throw new BadRequestError("Invalid due_date");
    }

    let borrowedAtForValidation = new Date(); // default now for validation
    let borrowedAtForInsert; // undefined unless provided

    if (borrowedAtRaw !== undefined) {
      const borrowedAt = new Date(borrowedAtRaw);
      if (Number.isNaN(borrowedAt.getTime())) {
        throw new BadRequestError("Invalid borrowed_at");
      }

      borrowedAtForValidation = borrowedAt;
      borrowedAtForInsert = borrowedAt.toISOString();
    }

    // Business rule: due_date must be after borrowed_at (or after now if borrowed_at not provided)
    if (dueDate <= borrowedAtForValidation) {
      throw new BadRequestError("due_date must be after borrowed_at");
    }

    // check borrower exists
    const borrower = await borrowerRepo.findById(borrowerId);
    if (!borrower) throw new NotFoundError("Borrower not found");

    // start transaction: atomic operation
    return db.transaction(async (trx) => {
      // try to decrement book quantity
      const updatedBook = await bookRepo.decrementAvailableQuantity(trx, bookId);
      if (!updatedBook) {
        // we need to know if book not found or out of stock
        const bookExists = await trx("books").where({ id: bookId }).first();
        if (!bookExists) throw new NotFoundError("Book not found");
        throw new BadRequestError("Book is out of stock");
      }

      // insert borrowing
      const createPayload = {
        book_id: bookId,
        borrower_id: borrowerId,
        due_date: dueDate.toISOString(),
      };

      // Only set borrowed_at if provided; otherwise DB default (now()) will be used
      if (borrowedAtForInsert) {
        createPayload.borrowed_at = borrowedAtForInsert;
      }

      const borrowing = await borrowingRepo.create(trx, createPayload);

      return { borrowing, book: updatedBook, borrower };
    });
  }


  async returnBook(payload) {
    const borrowingId = Number(payload.borrowing_id);
    if (!borrowingId) throw new BadRequestError("Missing required fields");

    const active = await borrowingRepo.findActiveById(borrowingId);
    if (!active) throw new NotFoundError("Active borrowing not found");

    return db.transaction(async (trx) => {
      const returned = await borrowingRepo.markReturned(trx, borrowingId);
      if (!returned) throw new NotFoundError("Borrowing not found");

      const updatedBook = await bookRepo.incrementAvailableQuantity(trx, returned.book_id);
      if (!updatedBook) throw new NotFoundError("Book not found");

      return { borrowing: returned, book: updatedBook };
    });
  }

  async listActiveBorrowingsForBorrower(borrowerId) {
    const id = Number(borrowerId);
    if (!id) throw new BadRequestError("Invalid borrower id");

    const borrower = await borrowerRepo.findById(id);
    if (!borrower) throw new NotFoundError("Borrower not found");

    const items = await borrowingRepo.listActiveByBorrowerId(id);
    return { borrower, borrowed_books: items };
  }

  async listOverdueBorrowings() {
    return borrowingRepo.listOverdue();
  }
}

module.exports = new BorrowingService();
