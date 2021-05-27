/*
    Used documentation at https://cloud.google.com/datastore/docs/concepts/entities
*/

const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
const onGoogle = process.env.GOOGLE_CLOUD;
let url = onGoogle
  ? "https://osu-493-portfolio.ue.r.appspot.com/users"
  : "http://localhost:5000/users";

module.exports = {
  addnewUser,
  getUsersByUsername,
  getUsers,
};

async function addnewUser(userObj) {
  const userKey = await datastore.key("User", userObj.username);
  const entity = {
    key: userKey,
    data: userObj,
  };
  await datastore.save(entity);
  return true;
}

async function getUsersByUsername(username) {
  const query = await datastore.createQuery("User");
  const [users] = await datastore.runQuery(query);

  for (const user of users) {
    if (user.username === username) {
      return user;
    }
  }
  return;
}

async function getUsers() {
  const query = await datastore.createQuery("User");
  const [users] = await datastore.runQuery(query);
  let user_list = [];

  for (const user of users) {
    let add_user = {
      id: user[datastore.KEY].id,
      username: user.username,
    };
    user_list.push(add_user);
  }
  return user_list;
}
