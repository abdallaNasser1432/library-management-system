const db = require("../db/knex");

class BorrowingRepository {
  async create(trx, payload) {
    const [created] = await trx("borrowings")
      .insert({
        book_id: payload.book_id,
        borrower_id: payload.borrower_id,
        due_date: payload.due_date,
      })
      .returning("*");

    return created;
  }

  async findById(id) {
    return db("borrowings").where({ id }).first();
  }

  async findActiveById(id) {
    return db("borrowings").where({ id }).whereNull("returned_at").first();
  }

  async listActiveByBorrowerId(borrowerId) {
    return db("borrowings")
      .select("borrowings.*", "books.title", "books.author", "books.isbn")
      .join("books", "borrowings.book_id", "books.id")
      .where("borrowings.borrower_id", borrowerId)
      .whereNull("borrowings.returned_at")
      .orderBy("borrowings.borrowed_at", "desc");
  }

  async listOverdue() {
    return db("borrowings")
      .select(
        "borrowings.*",
        "books.title",
        "books.author",
        "books.isbn",
        "borrowers.name as borrower_name",
        "borrowers.email as borrower_email"
      )
      .join("books", "borrowings.book_id", "books.id")
      .join("borrowers", "borrowings.borrower_id", "borrowers.id")
      .whereNull("borrowings.returned_at")
      .andWhere("borrowings.due_date", "<", db.fn.now())
      .orderBy("borrowings.due_date", "asc");
  }

  async markReturned(trx, borrowingId) {
    const [updated] = await trx("borrowings")
      .where({ id: borrowingId })
      .update({ returned_at: trx.fn.now(), updated_at: trx.fn.now() })
      .returning("*");

    return updated || null;
  }
  
  async listByPeriod({ from, to }) {
  return db("borrowings")
    .select(
      "borrowings.*",
      "books.title as book_title",
      "books.author as book_author",
      "books.isbn as book_isbn",
      "borrowers.name as borrower_name",
      "borrowers.email as borrower_email"
    )
    .join("books", "borrowings.book_id", "books.id")
    .join("borrowers", "borrowings.borrower_id", "borrowers.id")
    .whereBetween("borrowings.borrowed_at", [from, to])
    .orderBy("borrowings.borrowed_at", "desc");
  }

  async listByDueDatePeriod({ from, to }) {
  return db("borrowings")
    .select(
      "borrowings.*",
      "books.title as book_title",
      "books.author as book_author",
      "books.isbn as book_isbn",
      "borrowers.name as borrower_name",
      "borrowers.email as borrower_email"
    )
    .join("books", "borrowings.book_id", "books.id")
    .join("borrowers", "borrowings.borrower_id", "borrowers.id")
    .whereBetween("borrowings.due_date", [from, to])
    .orderBy("borrowings.due_date", "asc");
  }

}

module.exports = new BorrowingRepository();
