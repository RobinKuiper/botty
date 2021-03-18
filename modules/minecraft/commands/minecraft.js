// TODO: Refactor

/* eslint-disable no-case-declarations */
const fs = require("fs");
const request = require("request");

const EMOJI = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

let disabled = false;
let crafty_api_token, crafty_host;

const servers_file = "modules/minecraft/servers.json";

module.exports = {
  name: "minecraft",
  description:
    "- See info about the Minecraft server(s).\n- Control the Minecraft server(s).",
  aliases: ["mc"],
  category: "games",
  args: false,
  image:
    "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png",
  usage: ["[servername]", "[start/stop/restart] [servername]"],
  guildOnly: true,
  cooldown: 5,
  init(client) {
    client.info(`[${this.name}] Initializing.`);

    if (!checkConfig(client)) {
      disabled = true;
      return client.log(
        "error",
        "Minecraft config is not correct, disabling..."
      );
    }

    crafty_api_token = client.config.get("crafty_api_token");
    crafty_host = client.config.get("crafty_host");

    let JSONservers = getServersFromFile();
    getServersFromCrafty((err, res, servers) => {
      if (err) return console.log(err);

      for (let i = 0; i < servers.length; i++) {
        if (!JSONservers[servers[i].id]) {
          JSONservers[servers[i].id] = {
            name: servers[i].name,
            max_players: servers[i].max_players,
            group: null,
            depends_on: [],
            host: "",
            port: "",
            auto_stop_on_no_players: true,
            show_players: true,
            role_id: "",
            image: "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png" 
          };
        }else{
          if(!JSONservers[servers[i].id].image) JSONservers[servers[i].id].image = "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png";
        }
      }

      fs.writeFileSync(servers_file, JSON.stringify(JSONservers));
    });

    setInterval(() => {
      for (const key in JSONservers) {
        let i = 1;
        setTimeout(() => {
          const fServer = JSONservers[key];

          if (fServer.auto_stop_on_no_players) {
            getServerFromCraftyByName(fServer.name, (err, res, server) => {
              if (server.online_players === 0 && server.server_running) {
                post("stop", server.id, (err, res, body) => {
                  if (err) return console.log(err);

                  client.log(
                    "info",
                    `[Minecraft] Stopping ${server.name} server.`
                  );
                });
              }
            });
          }

          /*if (fServer.auto_stop_on_no_depends) {
            let running = false;
            for(const key in JSONservers){
              if(JSONservers[key].depends_on.includes(fServer.name.toLowerCase())){
                getServerFromCraftyByName(JSONservers[key].name, (err, res, server) => {
                  if(err) return;

                  if(server.server_running) running = true;
                });
              }
            }
            if(!running){
              post("stop", key, (err, res, body) => {
                if (err) return console.log(err);

                client.log(
                  "info",
                  `[Minecraft] Stopping ${fServer.name} server.`
                );
              });
            }
          }*/
          i++;
        }, 30000 * i);
      }
    }, 1000 * 60 * 30);
  },
  execute(message, args, client) {
    if (disabled) return;

    let serverName = args[1] ? args[1].toLowerCase() : "";

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    if (args.length > 0) {
      switch (args[0]) {
        case "start":
          handleServerCommandChat("start", serverName, message.channel);
          break;

        case "stop":
          handleServerCommandChat("stop", serverName, message.channel);
          break;

        case "restart":
          handleServerCommandChat("restart", args[1], message.channel);
          break;

        default:
          getServerFromCraftyByName(args[0], (err, res, server) => {
            if (err) return console.log(err);

            if (!server)
              return message.channel.send(`Server \`${args[0]}\` not found.`);

            let member = message.channel.guild.members.cache.get(
              message.author.id
            );
            sendServerInfo(server, message, hasRole(server, member));

            return;
          });
          break;
      }
    } else {
      getServersFromCrafty((err, res, servers) => {
        if (err) return console.log(err);

        let description = "";
        for (let i = 0; i < servers.length; i++) {
          let fServer = getServerFromFileById(servers[i].id);
          description += `${EMOJI[i]} ${
            servers[i].server_running ? "🟢" : "🔴"
          } **${servers[i].name}**`;
          description += fServer.show_players && servers[i].server_running
            ? ` *[${servers[i].online_players}/${servers[i].max_players}]*\n\n`
            : "\n\n";
        }

        const minecraftEmbed = {
          color: client.colors[Math.floor(Math.random() * client.colors.length)].hex,
          title: "__Minecraft Server Status__",
          description,
          timestamp: new Date(),
          thumbnail: {
            url:
              "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png",
          },
          footer: {
            icon_url:
              "https://cdn.discordapp.com/attachments/640894866934726658/643125915852996633/Crafty_Logo.png",
          },
        };

        return message.channel
          .send({ embed: minecraftEmbed })
          .then(async (m) => {
            const filter = (reaction, user) =>
              EMOJI.includes(reaction.emoji.name) && !user.bot;

            const collector = m.createReactionCollector(filter);

            collector.on("collect", (reaction) => {
              const server = servers[EMOJI.indexOf(reaction.emoji.name)];
              let member = message.channel.guild.members.cache.get(
                message.author.id
              );
              sendServerInfo(server, message, hasRole(server, member));
            });

            for (let i = 0; i < servers.length; i++) {
              await m.react(EMOJI[i]);
            }
          });
      });
    }
  },
};

function getServerFromFileByName(name) {
  const servers = getServersFromFile();

  if (!servers) return null;

  for (const key in servers) {
    if (servers[key].name.toLowerCase() === name.toLowerCase())
      return servers[key];
  }

  return null;
}

function getServerFromFileById(id) {
  const servers = getServersFromFile();

  if (!servers) return null;

  return servers[id] || null;
}

function getServersFromFile() {
  if (fs.existsSync(servers_file)) {
    return JSON.parse(fs.readFileSync(servers_file));
  }

  return null;
}

function getServerFromCraftyByName(name, callback) {
  getServersFromCrafty((err, res, servers) => {
    if (err) return callback(err);

    for (let i = 0; i < servers.length; i++) {
      let server = servers[i];

      if (server.name.toLowerCase() === name.toLowerCase())
        return callback(err, res, server);
    }

    return callback(err, res, null);
  });
}

function getServerFromCraftyById(id, callback) {
  getServersFromCrafty((err, res, servers) => {
    if (err) return callback(err);

    for (let i = 0; i < servers.length; i++) {
      let server = servers[i];

      if (server.id === id) return callback(err, res, server);
    }

    return callback(err, res, null);
  });
}

function getServersFromCrafty(callback) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  request(
    `${crafty_host}/api/v1/server_stats?token=${crafty_api_token}`,
    { json: true, rejectUnhauthorized: false },
    (err, res, body) => {
      if (err) return callback(err);

      return callback(err, res, body.data);
    }
  );
}

function hasRole(server, member) {
  server = getServerFromFileByName(server.name);
  return member.roles.cache.has(server.role_id);
}

function checkConfig(client) {
  if (
    !client.config.has("crafty_api_token") ||
    !client.config.get("crafty_api_token") ||
    !client.config.has("crafty_host") ||
    !client.config.get("crafty_host")
  )
    return false;

  return true;
}

function post(path, id, callback) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  request.post(
    `${crafty_host}/api/v1/server/${path}?token=${crafty_api_token}&id=${id}`,
    { json: true, rejectUnhauthorized: false },
    (err, res, body) => {
      if (err) return callback(err);

      if (body.status === 500) {
        return callback(body.errors);
      }

      return callback(err, res, body);
    }
  );
}

function get(path, id = null, callback) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  id = id ? `&id=${id}` : "";

  request(
    `${crafty_host}/api/v1/${path}?token=${crafty_api_token}${id}`,
    { json: true, rejectUnhauthorized: false },
    (err, res, body) => {
      if (err) return callback(err);

      return callback(err, res, body);
    }
  );
}

/*function getServerByName(servers, name) {
  return servers.filter((s) => s.name.toLowerCase() === name.toLowerCase())[0];
}*/

function handleServerCommandChat(command, servername, message) {
  getServerFromCraftyByName(servername, (err, res, server) => {
    if (err) return console.log(err);

    if (!server) return message.reply(`Server \`${servername}\` not found.`);

    postServerCommand(command, server, message);
  });
}

function postServerCommand(command, server, message) {
  const serverFromFile = getServerFromFileById(server.id);

  switch (command) {
    case "start":
      if (server.server_running) return;

      if (serverFromFile) {
        if (serverFromFile.depends_on && serverFromFile.depends_on.length > 0) {
          let i = 1;
          serverFromFile.depends_on.forEach((s) => {
            setTimeout(() => {
              handleServerCommandChat("start", s, message);
            }, 5000 * i);
            i++;
          });
        }
      }

      message.channel.send(
        `Server \`${server.name}\` is starting, please wait...`
      );
      break;

    case "stop":
      if (!server.server_running) return;

      const serversFromFile = getServersFromFile();

      let i = 1;
      for (const key in serversFromFile) {
        let s = serversFromFile[key];
        if (s.depends_on.includes(server.name.toLowerCase())) {
          setTimeout(() => {
            handleServerCommandChat("stop", s.name, message);
          }, 5000 * i);
          i++;
        }
      }

      message.channel.send(
        `Server \`${server.name}\` is stopping, please wait...`
      );
      break;

    case "restart":
      message.channel.send(
        `Server \`${server.name}\` is restarting, please wait...`
      );
  }

  post(command, server.id, (err, res, body) => {
    if (err) return console.log(err);
  });
}

function sendServerInfo(server, message, hasRole = false) {
  let JSONserver = getServerFromFileById(server.id);

  let description = `
                        Uptime: **${server.server_start_time}**\n
                        CPU Usage: **${server.cpu_usage}%**\n
                        Mem Usage: **${server.memory_usage}**\n
                        Players Online: **${server.online_players}/${server.max_players}**
                    `;

  const minecraftEmbed = {
    color: client.colors[Math.floor(Math.random() * client.colors.length)].hex,
    title: `${server.server_running ? "🟢" : "🔴"} __${
      server.name
    } Server Status__`,
    description,
    timestamp: new Date(),
    thumbnail: {
      url:
        "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png",
    },
    footer: {
      text: `${JSONserver.host}:${JSONserver.port}`,
      icon_url:
        "https://cdn.discordapp.com/attachments/640894866934726658/643125915852996633/Crafty_Logo.png",
    },
  };

  message.channel.send({ embed: minecraftEmbed }).then(async (m) => {
    if (hasRole) {
      if (server.server_running) {
        await m.react("♻️");
        await m.react("🛑");
      } else m.react("▶️");

      const filter = (reaction, user) => {
        let member = message.channel.guild.members.cache.get(message.author.id);
        const fServer = getServerFromFileByName(server.name);
        let hasRole = member.roles.cache.has(fServer.role_id);
        return (
          ["🛑", "▶️", "♻️"].includes(reaction.emoji.name) &&
          user.id === message.author.id &&
          hasRole &&
          !user.bot
        );
      };

      const collector = m.createReactionCollector(filter);

      collector.on("collect", (reaction) => {
        console.log("REACTION! " + reaction.emoji.name);
        if (reaction.emoji.name === "🛑")
          postServerCommand("stop", server, message);
        if (reaction.emoji.name === "▶️")
          postServerCommand("start", server, message);
        if (reaction.emoji.name === "♻️")
          postServerCommand("restart", server, message);
      });
    }
  });

  return;
}
