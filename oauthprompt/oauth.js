require("dotenv").config();
const router = require("express").Router();
const axios = require("axios");
const Users = require("../api/users/user_model");

const onGoogle = process.env.GOOGLE_CLOUD;
const url = onGoogle
  ? "https://osu-493-portfolio.ue.r.appspot.com/oauth"
  : "http://localhost:5000/oauth";
router.get("/", (req, res) => {
  axios
    .post(
      `https://oauth2.googleapis.com/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}&grant_type=authorization_code&access_type=offline&redirect_uri=${url}`,
    )
    .then((response) => {
      token = response.data.id_token;
      access_token = response.data.access_token;
      axios
        .get(
          `https://people.googleapis.com/v1/people/me?personFields=names&key=${process.env.API_KEY}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: "application/json",
            },
          },
        )
        .then((resp) => {
          // let user_obj = {
          //   first_name: resp.data.names[0].givenName,
          //   last_name: resp.data.names[0].familyName,
          // };
          // Users.addnewUser().then().catch()
          let html_str = `
            <h1>User Info</h1>
            <ul>
                <li>First Name: ${resp.data.names[0].givenName}</li>
                <li>Last Name: ${resp.data.names[0].familyName}</li>
                <li style="width:80%">Token: ${token}</li>
            </ul>
            `;
          res.status(200).send(html_str);
        })
        .catch((err) => {
          res.status(500).json({
            message: "could not get token",
            err: err,
            stack: "/oauth line 48",
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        message: "could not get token",
        error: err,
        stack: "/oauth line 56",
      });
    });
});

module.exports = router;
