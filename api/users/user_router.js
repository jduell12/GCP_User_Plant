const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const Users = require("./user_model");
const authenticate_jwt = require("../middleware/jwt-auth");
const helpers = require("./helpers");

//register a user to the database
router.post(
  "/register",
  authenticate_jwt,
  helpers.validateUser,
  async (req, res) => {
    try {
      if (req.jwt) {
        let user_obj = req.body;
        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hash = bcryptjs.hashSync(user_obj.password, rounds);
        user_obj.password = hash;

        const user_success = await Users.addnewUser(user_obj);
        if (user_success) {
          res.status(200).json({ message: "Success" });
        } else {
          res.status(500).json({
            error: e,
            errorMessage: "Error with Google Cloud Database",
            stack: "user_router line 27",
          });
        }
      } else {
        res
          .status(401)
          .json({ message: "Please supply a valid JWT to continue" });
      }
    } catch (e) {
      res.status(500).json({
        error: e,
        errorMessage: "Error with Google Cloud Database",
        stack: "user_router line 39",
      });
    }
  },
);

router.post("login", authenticate_jwt, async (req, res) => {
  const { username, password } = req.body;

  Users.getUsersByUsername(username)
    .then((user) => {
      if (user && bcryptjs.compareSync(password, user.password)) {
        res.status(200).json({ message: "Welcome" });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    })
    .catch((e) => {
      res.status(500).json({
        error: e.message,
        errorMessage: "Error with Google Cloud Database",
        stack: "user_router line 56",
      });
    });
});

module.exports = router;
