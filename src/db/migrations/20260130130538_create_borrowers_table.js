/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("borrowers", (table) => {
    table.increments("id").primary();

    table.string("name").notNullable();
    table.string("email").notNullable().unique();

    table.timestamp("registered_at").notNullable().defaultTo(knex.fn.now());

    table.timestamps(true, true);

    table.index(["name"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists("borrowers");
};
