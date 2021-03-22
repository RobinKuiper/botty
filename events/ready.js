/*const { Users } = require("../dbObjects");
require("../dbInit.js");*/
const WS = require("../ws/ws");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    client.info(`***************************************`);
    client.info(`*         Discord Bot Running.        *`);
    client.info(`*           ${client.bot.user.tag}            *`);
    client.info(`***************************************`);

    //client.user.setUsername(username);
    //client.user.setActivity(activity);
    //client.user.setStatus(state);
    //client.user.setAvatar(avatar);

    /*const u = await Users.findAll();
    u.forEach((u) => client.userList.set(u.user_id, u));*/

    let activities = [
      'Rekking n00bs',
      'Laughing at TheKing',
      'Ignoring WOW Players',
      'DND'
    ]

    client.bot.user.setActivity(activities[Math.floor(Math.random() * activities.length)]);

    setInterval(() => {
      client.bot.user.setActivity(activities[Math.floor(Math.random() * activities.length)]);
    }, 1000 * 60 * 5)

    client.commands.forEach((command) => {
      if (command.init && typeof command.init === "function")
        command.init(client);
    });

    let modules = require(path.join(client.folders.config, "modules.json"));
    for (let module of Object.keys(modules)) {
      if (modules[module].init) {
        if (
          fs.existsSync(path.join(client.folders.modules, module, "init.js"))
        ) {
          const init = require(path.join(
            client.folders.modules,
            module,
            "init.js"
          ));
          new init(client);
        }
      }
    }

    // Initialize Webserver
    new WS("123454", 4000, client);
  },
};
