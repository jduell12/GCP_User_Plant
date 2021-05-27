const express = require("express");
const cors = require("cors");
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
  res.status(200).json({ server: "working" });
});

module.exports = server;
