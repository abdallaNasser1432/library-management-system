/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("books", (table) => {
    table.increments("id").primary();

    table.string("title").notNullable();
    table.string("author").notNullable();

    table.string("isbn").notNullable().unique();

    table.integer("available_quantity").notNullable().defaultTo(0);
    table.string("shelf_location").notNullable();

    table.timestamps(true, true);

    table.index(["title"]);
    table.index(["author"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists("books");
};
