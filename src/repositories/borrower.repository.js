const db = require("../db/knex");

class BorrowerRepository {
  async create(payload) {
    const [created] = await db("borrowers")
      .insert({
        name: payload.name,
        email: payload.email,
        registered_at: payload.registered_at, // optional
      })
      .returning("*");

    return created;
  }

  async findById(id) {
    return db("borrowers").where({ id }).first();
  }

  async findByEmail(email) {
    return db("borrowers").where({ email }).first();
  }

  async list({ limit = 10, offset = 0 } = {}) {
    return db("borrowers")
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

    const [updated] = await db("borrowers")
      .where({ id })
      .update(updateData)
      .returning("*");

    return updated || null;
  }

  async deleteById(id) {
    const deletedCount = await db("borrowers").where({ id }).del();
    return deletedCount > 0;
  }
}

module.exports = new BorrowerRepository();
