const rateLimit = require("express-rate-limit");

const reportsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    errors: [],
  },
});

module.exports = {
  reportsLimiter,
};