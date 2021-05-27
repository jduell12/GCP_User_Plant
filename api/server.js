const express = require("express");
const cors = require("cors");
const fs = require("fs");
const server = express();

//routers
const oauth_prompt_router = require("../oauthprompt/oauthprompt");
const oauth_router = require("../oauthprompt/oauth");
const user_router = require("./users/user_router");

server.use(express.json());
server.use(cors());

server.use("/oauthprompt", oauth_prompt_router);
server.use("/oauth", oauth_router);
server.use("/users", user_router);

server.get("/", (req, res) => {
  try {
    fs.readFile("html/welcome.html", (error, pgRes) => {
      if (error) {
        res.status(404).json("Nothing to see here");
      } else {
        res.status(200).write(pgRes);
        res.end();
      }
    });
  } catch (e) {
    res.status(500).json({
      message: "error getting welcome page",
      error: e,
      stack: "/server line 25",
    });
  }
});

module.exports = server;
