/*
  Used documentation at https://developers.google.com/identity/sign-in/web/backend-auth
*/

require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

async function verify(check_token) {
  const ticket = await client.verifyIdToken({
    idToken: check_token,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const user_id = payload["sub"];
  return user_id;
}

module.exports = async (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    let token_arr = token.split(" ");
    await verify(token_arr[1])
      .then((sub) => {
        req.sub = sub;
        req.jwt = token_arr[1];
      })
      .catch((err) => {});
  }
  next();
};
