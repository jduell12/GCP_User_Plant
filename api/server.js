const express = require("express");
const cors = require("cors");
const server = express();

//routers
const oauth_prompt_router = require("../oauthprompt/oauthprompt");
const oauth_router = require("../oauthprompt/oauth");
const user_router = require("./users/user_router");
const plant_router = require("./plants/plant_router");
const plot_router = require("./plots/plot_router");

server.use(express.json());
server.use(cors());

server.use("/oauthprompt", oauth_prompt_router);
server.use("/oauth", oauth_router);
server.use("/users", checkHeaderType, user_router);
server.use("/plants", checkHeaderType, plant_router);
server.use("/plots", checkHeaderType, plot_router);

server.get("/", (req, res) => {
  res.status(200).json({ server: "working" });
});

function checkHeaderType(req, res, next) {
  if (req.headers["content-type"] === "application/json") {
    next();
  } else {
    res.status(415).json({ Error: "Request header should accept JSON object" });
  }
}

module.exports = server;
