/* eslint-disable no-case-declarations */
const Discord = require("discord.js");
const request = require("request");
const colors = require("../../colors.json");

const EMOJI = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

let disabled = false;
let crafty_api_token, crafty_host;

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
    client.log("info", "Initializing Minecraft.");

    if(!checkConfig(client)){
      disabled = true;
      return client.log('error', 'Minecraft config is not correct, disabling...');
    }

    crafty_api_token = client.config.get('crafty_api_token');
    crafty_host = client.config.get('crafty_host');
  },
  execute(message, args, client) {
    if(disabled) return;

    let member = message.channel.guild.members.cache.get(message.author.id);
    let hasRole = member.roles.cache.has("818848936210595860");

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    if (args.length > 0) {
      switch (args[0]) {
        case "start":
          handleServerCommandChat("start", args[1], message.channel);
          break;

        case "stop":
          handleServerCommandChat("stop", args[1], message.channel);
          break;

        case "restart":
          handleServerCommandChat("restart", args[1], message.channel);
          break;

        default:
          get("server_stats", null, (err, res, body) => {
            if (err) return console.log(err);

            let server = getServerByName(body.data, args[0]);

            if (!server)
              return message.channel.send(`Server \`${args[0]}\` not found.`);

            sendServerInfo(server, message, hasRole);

            return;
          });
          break;
      }
    } else {
      get("server_stats", null, (err, res, body) => {
        if (err) return console.log(err);

        let servers = body.data;

        let fields = [];

        for (let i = 0; i < servers.length; i++) {
          fields.push({
            name: servers[i].name,
            value: servers[i].server_running ? "🟢 Online" : "🔴 Offline",
            inline: true,
          });
        }

        let description = "";
        for (let i = 0; i < servers.length; i++) {
          description += `${EMOJI[i]} ${
            servers[i].server_running ? "🟢" : "🔴"
          } **${servers[i].name}** *[${servers[i].online_players}/${
            servers[i].max_players
          }]*\n\n`;
        }

        const minecraftEmbed = {
          color: colors[Math.floor(Math.random()*colors.length)].hex,
          title: "__Minecraft Server Status__",
          //fields,
          description,
          timestamp: new Date(),
          thumbnail: {
            url:
              "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png",
          },
          footer: {
            text: "robinkuiper.eu:25577",
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

            collector.on("collect", (reaction, user) => {
              const server = servers[EMOJI.indexOf(reaction.emoji.name)];
              sendServerInfo(server, message, hasRole);
            });

            for (let i = 0; i < servers.length; i++) {
              await m.react(EMOJI[i]);
            }
          });
      });
    }
  },
};

function checkConfig(client){
  if(!client.config.has('crafty_api_token') || !client.config.get('crafty_api_token') || !client.config.has('crafty_host') || !client.config.get('crafty_host')) return false;

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

function getServerByName(servers, name) {
  return servers.filter((s) => s.name.toLowerCase() === name.toLowerCase())[0];
}

function handleServerCommandChat(command, servername, message) {
  get("server_stats", null, (err, res, body) => {
    if (err) return console.log(err);

    let server = getServerByName(body.data, servername);
    if (!server) return message.reply(`Server \`${servername}\` not found.`);

    postServerCommand(command, server, message);
  });
}

function postServerCommand(command, server, message) {
  post(command, server.id, (err, res, body) => {
    if (err) return console.log(err);
  });

  switch (command) {
    case "start":
      return message.channel.send(
        `Server \`${server.name}\` is starting, please wait...`
      );

    case "stop":
      return message.channel.send(
        `Server \`${server.name}\` is stopping, please wait...`
      );

    case "restart":
      return message.channel.send(
        `Server \`${server.name}\` is restarting, please wait...`
      );
  }
}

function sendServerInfo(server, message, hasRole = false) {
  let description = `
                        Uptime: **${server.server_start_time}**\n
                        CPU Usage: **${server.cpu_usage}%**\n
                        Mem Usage: **${server.memory_usage}**\n
                        Players Online: **${server.online_players}/${server.max_players}**
                    `;

  const minecraftEmbed = {
    color: colors[Math.floor(Math.random()*colors.length)].hex,
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
      text: "robinkuiper.eu:25577",
      icon_url:
        "https://cdn.discordapp.com/attachments/640894866934726658/643125915852996633/Crafty_Logo.png",
    },
  };

  let m = message.channel.send({ embed: minecraftEmbed }).then(async (m) => {
    if (hasRole) {
      if (server.server_running) {
        await m.react("♻️");
        await m.react("🛑");
      } else m.react("▶️");

      const filter = (reaction, user) => {
        let member = message.channel.guild.members.cache.get(user.id);
        let hasRole = member.roles.cache.has("818848936210595860");
        return (
          ["🛑", "▶️", "♻️"].includes(reaction.emoji.name) &&
          user.id === message.author.id &&
          hasRole &&
          !user.bot
        );
      };

      const collector = m.createReactionCollector(filter);

      collector.on("collect", (reaction, user) => {
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
