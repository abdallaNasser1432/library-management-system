const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userRepo = require("../repositories/user.repository");
const { BadRequestError, ConflictError, NotFoundError } = require("../utils/errors");

class AuthService {
  async register(payload) {
    const { name, email, password } = payload;

    if (!name || !email || !password) {
      throw new BadRequestError("Missing required fields");
    }

    const existing = await userRepo.findByEmail(email);
    if (existing) throw new ConflictError("Email already exists");

    const password_hash = await bcrypt.hash(password, 10);

    const user = await userRepo.create({ name, email, password_hash });

    return user;
  }

  async login(payload) {
    const { email, password } = payload;

    if (!email || !password) {
      throw new BadRequestError("Missing required fields");
    }

    const user = await userRepo.findByEmail(email);
    if (!user) throw new NotFoundError("Invalid credentials");

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new NotFoundError("Invalid credentials");

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}

module.exports = new AuthService();
