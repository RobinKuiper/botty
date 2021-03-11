const fs = require("fs");
const request = require('request');
const logger = require("./logger");
const { token } = require("./config.json");
const { Users } = require("./dbObjects");

const Discord = require("discord.js");
const client = new Discord.Client({ partials: ["MESSAGE", "REACTION"] });

client.log = (type, message) => logger.log(type, message);

client.on("debug", (m) => logger.log("debug", m));
client.on("warn", (m) => logger.log("warn", m));
client.on("error", (m) => logger.log("error", m));
process.on("uncaughtException", (error) => logger.log("error", error));

client.userList = new Discord.Collection();

function calcLevel(xp) {
  return Math.floor(Math.sqrt(310 + 100 * (xp * 10) - 25) / 50);
}

Reflect.defineProperty(client.userList, "addExperience", {
  /* eslint-disable-next-line func-name-matching */
  value: async function add(id, amount) {
    const user = client.userList.get(id);
    if (user) {
      let levelUp = false;
      user.experience += Number(amount);

      // Level Up?
      if (calcLevel(user.experience) > user.level) {
        user.level = calcLevel(user.experience);
        levelUp = true;
      }

      user.save();

      return levelUp;
    }
    const newUser = await Users.create({ user_id: id, experience: amount });
    client.userList.set(id, newUser);
    return newUser;
  },
});

Reflect.defineProperty(client.userList, "getExperience", {
  /* eslint-disable-next-line func-name-matching */
  value: function getExperience(id) {
    const user = client.userList.get(id);
    return user ? user.experience : 0;
  },
});

Reflect.defineProperty(client.userList, "getLevel", {
  /* eslint-disable-next-line func-name-matching */
  value: function getLevel(id) {
    const experience = client.userList.getExperience(id);
    return calcLevel(experience);
  },
});

const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.cooldowns = new Discord.Collection();

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

client.login(token);