const fs = require("fs");
const path = require("path");
const folders = require("./data/folders");
const logger = require("./logger");
const config = require("config");

const Bot = require("./bot/bot");

const client = {};

client.colors = require("./data/colors.json");
client.folders = folders;
client.config = config;

/** Logger */
client.log = (type, message) => logger.log(type, message);
client.info = (message) => client.log("info", message);
client.error = (message) => client.log("error", message);
client.warn = (message) => client.log("warn", message);

client.info(`ENVIRONMENT: ${process.env.NODE_ENV}`);

/** Load Modules */
const modules = getModulesFromJSON();
const moduleFolders = fs.readdirSync(folders.modules);
// Loop through module folder.
for (const moduleName of moduleFolders) {
  const moduleFolder = path.join(folders.modules, moduleName);

  // Check if module has a module.json file.
  if (!fs.existsSync(path.join(moduleFolder, "module.json"))) {
    client.warn(`Module ${moduleName} does not have a module.json`);
    continue;
  }

  const module = require(path.join(moduleFolder, "module.json"));

  // If module is not in module.json file, add it.
  if (!modules[moduleFolder]) {
    modules[module.name] = module;
    modules[module.name] = Object.assign(modules[module.name], {
        name: module.name,
      events: {},
      commands: {},
      routes: {},
      disabled: false,
    });
  }

  // Load Events
  const eventFolder = path.join(moduleFolder, "events");
  if (fs.existsSync(eventFolder)) {
    const events = fs
      .readdirSync(eventFolder)
      .filter((file) => file.endsWith(".js"));
    for (const eventsFile of events) {
      const event = require(path.join(eventFolder, eventsFile));

      if(!modules[module.name].events[event.name]){
        modules[module.name].events[event.name] = {
            name: event.name,
            disabled: false,
            once: event.once,
            file: eventsFile
        }
      }
    }
  }

  // Load Commands
  const commandFolder = path.join(moduleFolder, "commands");
  if (fs.existsSync(commandFolder)) {
    const commands = fs
      .readdirSync(commandFolder)
      .filter((file) => file.endsWith(".js"));
    for (const commandsFile of commands) {
      const command = require(path.join(commandFolder, commandsFile));

      if(!modules[module.name].commands[command.name]){
        modules[module.name].commands[command.name] = {
            name: command.name,
            disabled: false,
            file: commandsFile
        }
      }
    }
  }

    // Load Routes
    const routeFolder = path.join(moduleFolder, "routes");
    if (fs.existsSync(routeFolder)) {
      const routes = fs
        .readdirSync(routeFolder)
        .filter((file) => file.endsWith(".js"));
      for (const routesFile of routes) {
        const route = require(path.join(routeFolder, routesFile));
  
        if(!modules[module.name].routes[route.name]){
          modules[module.name].routes[route.route] = {
              route: route.route,
              type: route.type,
              disabled: false,
              file: routesFile
          }
        }
      }
    }

  // Check if module is disabled.
  if (module.disabled) {
    client.info(`Module ${module.name} is disabled, not loading.`);
    continue;
  }
}

// Write modules to disk.
fs.writeFileSync(
  path.join(folders.config, "modules.json"),
  JSON.stringify(modules, null, 4)
);
// Add modules to client object.
client.modules = removeDisabled(modules);
client.modules.events = removeDisabled(modules.events);
client.modules.commands = removeDisabled(modules.commands);
client.modules.routes = removeDisabled(modules.routes);

// Initialize Bot
new Bot(client);

function getModulesFromJSON() {
  if (fs.existsSync(`${folders.config}/modules.json`)) {
    return JSON.parse(fs.readFileSync(`${folders.config}/modules.json`));
  }

  return {};
}

function removeDisabled(obj) {
  let result = {};

  for (let key in obj) {
    if (obj[key] && !obj[key].disabled) result[key] = obj[key];
  }

  return result;
}
