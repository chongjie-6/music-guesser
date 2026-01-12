const rateLimiter = require("express-rate-limit");

const limiter = rateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again later",
});

module.exports = limiter;
