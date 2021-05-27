const router = require("express").Router();
const Users = require("./user_model");
const helpers = require("./helpers");

router.post("/register", helpers.validateUser, async (req, res) => {
  res.status(200).json({ users: [{ username: "working" }] });
});

router.get("/", async (req, res) => {
  Users.getUsers()
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
