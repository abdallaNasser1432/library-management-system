const db = require("../db/knex");

const bookRepo = require("../repositories/book.repository");
const borrowerRepo = require("../repositories/borrower.repository");
const borrowingRepo = require("../repositories/borrowing.repository");

const { BadRequestError, NotFoundError } = require("../utils/errors");

class BorrowingService {
  async checkout(payload) {
    const bookId = Number(payload.book_id);
    const borrowerId = Number(payload.borrower_id);
    const dueDate = payload.due_date;

    if (!bookId || !borrowerId || !dueDate) {
      throw new BadRequestError("Missing required fields");
    }

    // check borrower Exsist
    const borrower = await borrowerRepo.findById(borrowerId);
    if (!borrower) throw new NotFoundError("Borrower not found");

    // start transaction: atomic operation
    return db.transaction(async (trx) => {
      // try to decrement book quantitiy
      const updatedBook = await bookRepo.decrementAvailableQuantity(trx, bookId);
      if (!updatedBook) {
        // we need to know if book not found or out of stock
        const bookExists = await trx("books").where({ id: bookId }).first();
        if (!bookExists) throw new NotFoundError("Book not found");
        throw new BadRequestError("Book is out of stock");
      }

      // insert borrowing
      const borrowing = await borrowingRepo.create(trx, {
        book_id: bookId,
        borrower_id: borrowerId,
        due_date: dueDate,
      });

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
