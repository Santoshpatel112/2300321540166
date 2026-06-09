const jwt = require("jsonwebtoken");

const getToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET || "secret", {
    expiresIn: "7d",
  });
};

module.exports = getToken;
