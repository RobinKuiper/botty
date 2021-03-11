const { username, state, activity, avatar } = require("../config.json");
const { Users } = require("../dbObjects");
require("../dbInit.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    client.log('info', `Ready! Logged in as ${client.user.tag}`);

    //client.user.setUsername(username);
    client.user.setActivity(activity);
    //client.user.setStatus(state);
    //client.user.setAvatar(avatar);

    const u = await Users.findAll();
    u.forEach((u) => client.userList.set(u.user_id, u));

    client.commands.forEach((command) => {
      if (command.init && typeof command.init === "function")
        command.init(client);
    });
  },
};
