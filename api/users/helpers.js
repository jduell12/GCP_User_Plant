const Users = require("./user_model");

module.exports = {
  validateUser,
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
      res
        .status(400)
        .json({
          Error:
            "The request object attributes have one or more of the wrong type",
        });
    }
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
