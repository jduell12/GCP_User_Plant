require("dotenv").config();
const router = require("express").Router();

const onGoogle = process.env.GOOGLE_CLOUD;
const url = onGoogle
  ? "https://osu-493-portfolio.ue.r.appspot.com/oauth"
  : "http://localhost:5000/oauth";

router.post("/", (req, res) => {
  console.log(req);
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&response_type=code&scope=https://www.googleapis.com/auth/userinfo.profile&redirect_uri=${url}`,
  );
});

module.exports = router;
