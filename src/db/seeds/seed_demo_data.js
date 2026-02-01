const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  // Reset data (demo/testing only)
  await knex.raw(
    'TRUNCATE TABLE "borrowings", "borrowers", "books", "users" RESTART IDENTITY CASCADE'
  );

  // ---- Users (Auth demo) ----
  const password_hash = await bcrypt.hash("Abdalla@12345", 10);
  await knex("users").insert([
    { name: "Admin User", email: "abdalla@example.com", password_hash },
  ]);

  // ---- Books ----
await knex("books").insert([
  { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", available_quantity: 5, shelf_location: "A-1" },
  { title: "Refactoring", author: "Martin Fowler", isbn: "9780201485677", available_quantity: 3, shelf_location: "A-2" },
  { title: "Design Patterns", author: "Gang of Four", isbn: "9780201633610", available_quantity: 4, shelf_location: "A-3" },
  { title: "You Don't Know JS", author: "Kyle Simpson", isbn: "9781491904244", available_quantity: 6, shelf_location: "B-1" },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "9780201616224", available_quantity: 2, shelf_location: "B-2" },
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "9780262033848", available_quantity: 7, shelf_location: "C-1" },
  { title: "Cracking the Coding Interview", author: "Gayle Laakmann", isbn: "9780984782857", available_quantity: 5, shelf_location: "C-2" },
  { title: "Working Effectively with Legacy Code", author: "Michael Feathers", isbn: "9780131177055", available_quantity: 3, shelf_location: "C-3" },
  { title: "Domain-Driven Design", author: "Eric Evans", isbn: "9780321125217", available_quantity: 4, shelf_location: "D-1" },
  { title: "Clean Architecture", author: "Robert C. Martin", isbn: "9780134494166", available_quantity: 6, shelf_location: "D-2" },
  { title: "Patterns of Enterprise Application Architecture", author: "Martin Fowler", isbn: "9780321127426", available_quantity: 2, shelf_location: "D-3" },
  { title: "The Mythical Man-Month", author: "Fred Brooks", isbn: "9780201835953", available_quantity: 3, shelf_location: "E-1" },
  { title: "Site Reliability Engineering", author: "Google", isbn: "9781491929124", available_quantity: 5, shelf_location: "E-2" },
  { title: "Effective Java", author: "Joshua Bloch", isbn: "9780134685991", available_quantity: 4, shelf_location: "E-3" },
  { title: "Programming Pearls", author: "Jon Bentley", isbn: "9780201657883", available_quantity: 2, shelf_location: "F-1" },
]);


  // ---- Borrowers ----
  await knex("borrowers").insert([
    { name: "Sara Ali", email: "sara@example.com" },
    { name: "Abdalla Nasser", email: "abdalla@example.com" },
    { name: "Rami Adel", email: "rami@example.com" },
  ]);

  /**
   * Today (per our timeline) is Feb 1, 2026
   * Last month = Jan 2026
   *
   * Bonus #3: all borrowing processes of last month => borrowed_at in Jan 2026
   * Bonus #2: overdue borrows of last month => due_date in Jan 2026 AND (returned_at is null OR returned_at > due_date)
   */

await knex("borrowings").insert([
  // Overdue (due in Jan, not returned)
  { book_id: 1, borrower_id: 1, borrowed_at: "2026-01-05", due_date: "2026-01-12", returned_at: null },
  { book_id: 2, borrower_id: 2, borrowed_at: "2026-01-08", due_date: "2026-01-15", returned_at: null },

  // Overdue (returned late)
  { book_id: 3, borrower_id: 3, borrowed_at: "2026-01-10", due_date: "2026-01-17", returned_at: "2026-01-25" },
  { book_id: 4, borrower_id: 1, borrowed_at: "2026-01-12", due_date: "2026-01-18", returned_at: "2026-01-28" },

  // Returned on time (not overdue)
  { book_id: 5, borrower_id: 2, borrowed_at: "2026-01-03", due_date: "2026-01-10", returned_at: "2026-01-09" },
  { book_id: 6, borrower_id: 3, borrowed_at: "2026-01-07", due_date: "2026-01-14", returned_at: "2026-01-13" },

  // Still active but due in Jan (overdue after Jan)
  { book_id: 7, borrower_id: 1, borrowed_at: "2026-01-20", due_date: "2026-01-27", returned_at: null },
  { book_id: 8, borrower_id: 2, borrowed_at: "2026-01-22", due_date: "2026-01-29", returned_at: null },

  // Borrowed in Jan but due in Feb (not overdue in Jan)
  { book_id: 9, borrower_id: 3, borrowed_at: "2026-01-25", due_date: "2026-02-05", returned_at: null },
  { book_id: 10, borrower_id: 1, borrowed_at: "2026-01-26", due_date: "2026-02-06", returned_at: null },

  // Borrowed in February 2026 (should NOT appear in last month reports)
  { book_id: 13, borrower_id: 1, borrowed_at: "2026-02-02", due_date: "2026-02-10", returned_at: null },
  { book_id: 14, borrower_id: 2, borrowed_at: "2026-02-03", due_date: "2026-02-12", returned_at: null },
  { book_id: 15, borrower_id: 3, borrowed_at: "2026-02-04", due_date: "2026-02-14", returned_at: null },


  // Some older (Dec 2025) to test filtering
  { book_id: 11, borrower_id: 2, borrowed_at: "2025-12-10", due_date: "2025-12-20", returned_at: "2025-12-18" },
  { book_id: 12, borrower_id: 3, borrowed_at: "2025-12-15", due_date: "2025-12-28", returned_at: null },
  
]);


};
