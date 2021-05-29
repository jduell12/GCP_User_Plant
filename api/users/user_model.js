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
  return {
    id: userKey.id,
    username: userObj.username,
  };
}

async function getUsersByUsername(username) {
  const query = await datastore.createQuery("User");
  const [users] = await datastore.runQuery(query);

  for (const user of users) {
    if (user.username === username) {
      return {
        id: user[datastore.KEY].id,
        username: user.username,
        password: user.password,
      };
    }
  }
  return;
}

async function getUsers(req) {
  let query = await datastore.createQuery("User");
  const [users] = await datastore.runQuery(query);
  let user_obj = { total_users: users.length };
  let prev;
  query = await datastore.createQuery("User").limit(5);

  if (Object.keys(req.query).includes("cursor")) {
    prev =
      req.protocol +
      "://" +
      req.get("host") +
      req.baseUrl +
      "?cursor=" +
      req.query.cursor;
    query = query.start(req.query.cursor);
  }

  return datastore.runQuery(query).then((res) => {
    const users = res[0];
    let user_list = [];

    for (const user of users) {
      let add_user = {
        id: user[datastore.KEY].id,
        username: user.username,
      };
      user_list.push(add_user);
    }
    user_obj.users = user_list;

    if (typeof prev !== undefined) {
      user_obj.previous = prev;
    }

    if (res[1].moreResults !== datastore.NO_MORE_RESULTS) {
      user_obj.next =
        req.protocol +
        "://" +
        req.get("host") +
        req.baseUrl +
        "?cursor=" +
        res[1].endCursor;
    }
    return user_obj;
  });
}
