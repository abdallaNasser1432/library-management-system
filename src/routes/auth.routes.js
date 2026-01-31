const express = require("express");
const authService = require("../services/auth.service");

const router = express.Router();

// Register
router.post("/register", async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return res.success(user, "User registered", 201);
  } catch (err) {
    next(err);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.success(result, "Login successful");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
