/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("borrowings", (table) => {
    table.increments("id").primary();

    table
      .integer("book_id")
      .notNullable()
      .references("id")
      .inTable("books")
      .onDelete("RESTRICT");

    table
      .integer("borrower_id")
      .notNullable()
      .references("id")
      .inTable("borrowers")
      .onDelete("RESTRICT");

    table.timestamp("borrowed_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("due_date").notNullable();

    table.timestamp("returned_at").nullable();

    table.timestamps(true, true);

    // Fast queries: active borrows per borrower + overdue
    table.index(["borrower_id", "returned_at"]);
    table.index(["due_date", "returned_at"]);

  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists("borrowings");
};
