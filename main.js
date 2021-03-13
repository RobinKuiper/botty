const fs = require("fs");
const logger = require("./logger");
const config = require("config");
const { Users } = require("./dbObjects");

const WS = require("./ws/ws");

const Discord = require("discord.js");
const client = new Discord.Client({ partials: ["MESSAGE", "REACTION"] });

client.config = config;

client.log = (type, message) => logger.log(type, message);
client.log("info", `Environment: ${process.env.NODE_ENV}`);

client.cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();

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

// Load Core Events
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.init && typeof event.init === "function") event.init(client);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }

  client.log("info", `[Core Event] ${event.name} loaded.`);
}

// Load Core Commands
const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);

    client.log("info", `[Core Command] ${command.name} loaded.`);
  }
}

// Load Modules
const moduleFolders = fs.readdirSync("./modules");
let modules = getModules();
for (const moduleFolder of moduleFolders) {
  if (modules[moduleFolder] && modules[moduleFolder].disabled) continue;

  if (!modules[moduleFolder]) {
    modules[moduleFolder] = {
      events: {},
      commands: {},
      disabled: false,
      description: ''
    };
  }

  const modulePath = `./modules/${moduleFolder}`;

  client.log("info", `[Module] Loading ${moduleFolder}.`);

  // Load Module Events
  if (fs.existsSync(`${modulePath}/events`)) {
    const eventFiles = fs
      .readdirSync(`${modulePath}/events`)
      .filter((file) => file.endsWith(".js"));
    for (const eventFile of eventFiles) {
      const event = require(`${modulePath}/events/${eventFile}`);

      if (
        modules[moduleFolder].events[event.name] &&
        modules[moduleFolder].events[event.name].disabled
      )
        continue;

      if (!modules[moduleFolder].events[event.name]) {
        modules[moduleFolder].events[event.name] = {
          event: event.name,
          disabled: false,
        };
      }

      if (event.init && typeof event.init === "function") event.init(client);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      client.log(
        "info",
        `[Module Event] ${moduleFolder} ${event.name} loaded.`
      );
    }
  }

  // Load Module Commands
  if (fs.existsSync(`${modulePath}/commands`)) {
    const commandFiles = fs
      .readdirSync(`${modulePath}/commands`)
      .filter((file) => file.endsWith(".js"));
    for (const commandFile of commandFiles) {
      const command = require(`${modulePath}/commands/${commandFile}`);

      if (
        modules[moduleFolder].commands[command.name] &&
        modules[moduleFolder].commands[command.name].disabled
      )
        continue;

      if (!modules[moduleFolder].commands[command.name]) {
        modules[moduleFolder].commands[command.name] = {
          command: command.name,
          disabled: false,
        };
      }

      client.commands.set(command.name, command);

      client.log(
        "info",
        `[Module Command] ${moduleFolder} ${command.name} loaded.`
      );
    }
  }
}

fs.writeFileSync("config/modules.json", JSON.stringify(modules));

if (!config.has("token") || !config.get("token")) {
  client.log(
    "error",
    "You have not provided a Discord bot token in the config files."
  );
} else client.login(config.get("token"));

// TODO: To client ready...
const ws = new WS("123454", 4000, client);

function getModules() {
  if (fs.existsSync("config/modules.json")) {
    return JSON.parse(fs.readFileSync("config/modules.json"));
  }

  return {};
}
