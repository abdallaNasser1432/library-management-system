const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/user.repository");
const { UnauthorizedError } = require("../utils/errors");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const token = header.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userRepo.findById(payload.sub);
    if (!user) throw new UnauthorizedError("User not found");

    req.user = user;
    next();
  } catch (err) {
    return next(new UnauthorizedError());
  }
};
