const db = require("../db/knex");

class BookRepository {
  async create(payload) {
    const [created] = await db("books")
      .insert({
        title: payload.title,
        author: payload.author,
        isbn: payload.isbn,
        available_quantity: payload.available_quantity ?? 0,
        shelf_location: payload.shelf_location,
      })
      .returning("*");

    return created;
  }

  async findById(id) {
    return db("books").where({ id }).first();
  }

  async findByIsbn(isbn) {
    return db("books").where({ isbn }).first();
  }

  async list({ limit = 10, offset = 0 } = {}) {
    return db("books")
      .select("*")
      .orderBy("id", "desc")
      .limit(limit)
      .offset(offset);
  }

  async updateById(id, payload) {
    const updateData = {
      ...payload,
      updated_at: db.fn.now(),
    };

    const [updated] = await db("books")
      .where({ id })
      .update(updateData)
      .returning("*");

    return updated || null;
  }

  async deleteById(id) {
    const deletedCount = await db("books").where({ id }).del();
    return deletedCount > 0;
  }

  async search({ title, author, isbn, limit = 10, offset = 0 } = {}) {
    const q = db("books").select("*");

    if (isbn) q.where("isbn", isbn);
    if (title) q.andWhereILike("title", `%${title}%`);
    if (author) q.andWhereILike("author", `%${author}%`);

    return q.orderBy("id", "desc").limit(limit).offset(offset);
  }
}

module.exports = new BookRepository();