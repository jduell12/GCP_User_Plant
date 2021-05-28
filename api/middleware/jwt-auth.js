const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    let token_arr = token.split(" ");
    jwt.verify(token_arr[1], process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "Invalid token" });
      } else {
        req.jwt = decodedToken;
        req.sub = decodedToken.subject;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Invalid token" });
  }
};
