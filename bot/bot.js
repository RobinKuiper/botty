const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

class Bot {
  constructor(client) {
    this.folders = {
      modules: path.join(__dirname, "../modules"),
      events: path.join(__dirname, "../events"),
      commands: path.join(__dirname, "../commands"),
      config: path.join(__dirname, "../config"),
    };

    client.bot = new Discord.Client({ partials: ["MESSAGE", "REACTION"] });

    client.cooldowns = new Discord.Collection();
    client.commands = new Discord.Collection();

    this.initializeCore(client);
    this.initializeModules(client);

    if (!client.config.has("token") || !client.config.get("token")) {
      client.log(
        "error",
        "You have not provided a Discord bot token in the config files."
      );
    } else client.bot.login(client.config.get("token"));
  }

  initializeCore(client) {
    this.loadCoreEvents(client);
    this.loadCoreCommands(client);
  }

  initializeModules(client) {
    for (let moduleName in client.modules) {
      const modulePath = path.join(client.folders.modules, moduleName);
      const eventsPath = path.join(modulePath, "events");
      const commandsPath = path.join(modulePath, "commands");

      const module = client.modules[moduleName];

      // Events
      for (const eventName in module.events) {
        const event = require(path.join(
          eventsPath,
          module.events[eventName].file
        ));

        if (event.init && typeof event.init === "function") event.init(client);
        if (event.once) {
          client.bot.once(event.name, (...args) =>
            event.execute(...args, client)
          );
        } else {
          client.bot.on(event.name, (...args) =>
            event.execute(...args, client)
          );
        }

        client.log(
          "info",
          `[Module] [Event] ${moduleName} ${event.name} loaded.`
        );
      }

      // Events
      for (const commandName in module.commands) {
        const command = require(path.join(
          commandsPath,
          module.commands[commandName].file
        ));

        client.commands.set(command.name, command);

          client.log(
            "info",
            `[Module] [Command] ${moduleName} ${command.name} loaded.`
          );
      }
    }
  }

  loadCoreEvents(client) {
    // Load Core Events
    const eventFiles = fs
      .readdirSync(this.folders.events)
      .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
      const event = require(`${this.folders.events}/${file}`);
      if (event.init && typeof event.init === "function") event.init(client);
      if (event.once) {
        client.bot.once(event.name, (...args) =>
          event.execute(...args, client)
        );
      } else {
        client.bot.on(event.name, (...args) => event.execute(...args, client));
      }

      client.log("info", `[Core] [Event] ${event.name} loaded.`);
    }
  }

  loadCoreCommands(client) {
    // Load Core Commands
    const commandFolders = fs.readdirSync(this.folders.commands);

    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`${this.folders.commands}/${folder}`)
        .filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const command = require(`${this.folders.commands}/${folder}/${file}`);
        client.commands.set(command.name, command);

        client.log("info", `[Core] [Command] ${command.name} loaded.`);
      }
    }
  }

  getModules() {
    if (fs.existsSync(`${this.folders.config}/modules.json`)) {
      return JSON.parse(fs.readFileSync(`${this.folders.config}/modules.json`));
    }

    return {};
  }
}

module.exports = Bot;
