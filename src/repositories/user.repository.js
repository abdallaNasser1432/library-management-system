const db = require("../db/knex");

class UserRepository {
  async create(payload) {
    const [created] = await db("users")
      .insert({
        name: payload.name,
        email: payload.email,
        password_hash: payload.password_hash,
      })
      .returning(["id", "name", "email", "created_at"]);

    return created;
  }

  async findByEmail(email) {
    return db("users").where({ email }).first();
  }

  async findById(id) {
    return db("users")
      .select("id", "name", "email", "created_at")
      .where({ id })
      .first();
  }
}

module.exports = new UserRepository();
