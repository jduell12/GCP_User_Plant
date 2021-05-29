const router = require("express").Router();
const Users = require("./user_model");
const helpers = require("./helpers");
const bcryptjs = require("bcryptjs");

//register a new user and return a jwt token
router.post("/register", helpers.validateUser, async (req, res) => {
  const user = req.body;
  const rounds = parseInt(process.env.BCRYPT_ROUTS) || 12;
  const hash = bcryptjs.hashSync(user.password, rounds);
  user.password = hash;

  Users.addnewUser(user)
    .then((added_user) => {
      const token = helpers.signToken(added_user);
      let send_user = added_user;
      send_user.token = token;
      res.status(201).json(send_user);
    })
    .catch((e) => {
      res.status(500).json({
        error: e,
        errorMessage: "Something went wrong with Google Cloud Database",
        stack: "user_router line 23",
      });
    });
});

//login a previously registered user and return a jwt token
router.post("/login", helpers.validateLogin, async (req, res) => {
  const { username, password } = req.body;
  Users.getUsersByUsername(username).then((user) => {
    if (user && bcryptjs.compareSync(password, user.password)) {
      const token = helpers.signToken(user);
      send_user = {
        id: user.id,
        username: user.username,
        token: token,
      };
      res.status(200).json(send_user);
    }
  });
});

//get all users and their unique ids
router.get("/", async (req, res) => {
  Users.getUsers(req)
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((e) => {
      res.status(500).json({
        error: e.message,
        errorMessage: "Error with Google Cloud Database",
        stack: "user_router line 78",
      });
    });
});

module.exports = router;
