require("dotenv").config();
const Users = require("./user_model");
const jwt = require("jsonwebtoken");

module.exports = {
  validateUser,
  validateLogin,
  signToken,
};

function validateUser(req, res, next) {
  let body = req.body;
  if (
    body.username &&
    body.password &&
    body.email &&
    body.first_name &&
    body.last_name
  ) {
    const check_types = checkUserTypes(body);
    if (check_types) {
      next();
    } else {
      res.status(400).json({
        Error:
          "The request object attributes have one or more of the wrong type",
      });
    }
  } else {
    res
      .status(400)
      .json({ Error: "The request object is missing required attributes" });
  }
}

function checkUserTypes(userObj) {
  if (
    typeof userObj.username === "string" &&
    typeof userObj.password === "string" &&
    typeof userObj.first_name === "string" &&
    typeof userObj.last_name === "string"
  ) {
    return true;
  }
  return false;
}

function validateLogin(req, res, next) {
  let body = req.body;
  if (
    body.username &&
    body.password &&
    typeof body.username === "string" &&
    typeof body.password === "string"
  ) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "Please supply a username and password to login" });
  }
}

function signToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const secret = process.env.JWT_SECRET;

  const options = {
    expiresIn: "1h",
  };
  return jwt.sign(payload, secret, options);
}
