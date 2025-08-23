const jwt = require("jsonwebtoken");
require("dotenv").config();

const createSecretToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set in .env");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

module.exports = { createSecretToken };
