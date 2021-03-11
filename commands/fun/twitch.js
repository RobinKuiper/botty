const fs = require("fs");
const { ApiClient } = require("twitch");
const { ClientCredentialsAuthProvider } = require("twitch-auth");
const { WebHookListener, SimpleAdapter } = require("twitch-webhooks");

const { twitch_client_id, twitch_client_secret } = require("../../config.json");

const colors = require("../../colors.json");

const twitch_user_file = "data/twitch_subscriptions.json";

let apiClient = null;
let listener = null;
let listeners = {};

module.exports = {
  name: "twitch",
  description: "Twitch Info!",
  aliases: [],
  category: "fun",
  image: "http://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c540.png",
  args: false,
  usage: ["bloep"],
  guildOnly: false,
  cooldown: 5,
  async init(client) {
    client.log("info", "Initializing Twitch.");

    const authProvider = new ClientCredentialsAuthProvider(
      twitch_client_id,
      twitch_client_secret
    );
    apiClient = new ApiClient({ authProvider });

    listener = new WebHookListener(
      apiClient,
      new SimpleAdapter({
        hostName: "robinkuiper.eu",
        listenerPort: 8090,
      })
    );
    await listener.listen();

    let subscriptions = getSubscriptions();

    if (subscriptions && subscriptions.length > 0) {
      for (let i = 0; i < subscriptions.length; i++) {
        let guild = client.guilds.cache.get(subscriptions[i].guildid);
        let channel = guild.channels.cache.get(subscriptions[i].channelid);
        subscribe(subscriptions[i].twitchname, channel, client);

        client.log("info", `Subscribing to ${subscriptions[i].twitchname}`);
      }
    }
  },
  async execute(message, args, client) {
    const command = args[0];
    const twitchname = args[1];
    let subscriptions = [];

    switch (command) {
      case "subscribe":
        const channel = message.mentions.channels.first() || message.channel;

        if (!twitchname)
          return message.channel.send(`You didn't give a twitch name.`);

        subscribe(twitchname, message.channel, client);

        subscriptions =
          getSubscriptions().filter((u) => u.twitchname !== twitchname) || [];

        subscriptions.push({
          twitchname,
          guildid: message.channel.guild.id,
          channelid: channel.id,
        });
        fs.writeFileSync(twitch_user_file, JSON.stringify(subscriptions));

        message.channel.send(
          `You are now subscribed to \`${twitchname}\` in <#${channel.id}>.`
        );
        break;

      case "unsubscribe":
        if (listeners[twitchname]) listeners[twitchname].stop();

        subscriptions =
          getSubscriptions().filter((u) => u.twitchname !== twitchname) || [];

        fs.writeFileSync(twitch_user_file, JSON.stringify(subscriptions));

        message.channel.send(`You have unsubscribed from \`${twitchname}\`.`);
        break;

      default:
        message.channel.send(`Command \`${command}\` not found.`);
        break;
    }
  },
};

function getSubscriptions() {
  if (fs.existsSync(twitch_user_file)) {
    let raw_users = fs.readFileSync(twitch_user_file);
    return JSON.parse(raw_users);
  }

  return null;
}

async function subscribe(twitchname, channel, client) {
  let prevStream = await apiClient.helix.streams.getStreamByUserName(
    twitchname
  );

  const user = await apiClient.helix.users.getUserByName(twitchname);

  if (listeners[twitchname]) listeners[twitchname].stop();

  listeners[twitchname] = await listener.subscribeToStreamChanges(
    user.id,
    async (stream) => {
      if (stream) {
        if (!prevStream) {
          client.log(
            "info",
            `${stream.userDisplayName} just went live with title: ${stream.title}`
          );

          stream.getGame().then((game) => {
            stream.getUser().then((user) => {
              const embed = {
                color: colors[Math.floor(Math.random() * colors.length)].hex,
                title: `${stream.title}`,
                url: `https://twitch.tv/${stream.userDisplayName}`,
                author: {
                  icon_url: user.profilePictureUrl,
                  name: stream.userDisplayName,
                  url: `https://twitch.tv/${stream.userDisplayName}`,
                },
                fields: {
                  value: `${game.name}`,
                  name: "Game",
                },
                timestamp: new Date(),
                thumbnail: {
                  url: user.profilePictureUrl,
                },
                image: {
                  url: stream.getThumbnailUrl(1920, 1080),
                },
                footer: {
                  text: `https://twitch.tv/${stream.userDisplayName}`,
                  icon_url:
                    "http://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c540.png",
                },
              };

              let m = channel.send({ embed: embed });
            });
          });
        }
      } else {
        // no stream, no display name
        const user = await apiClient.helix.users.getUserByName(twitchname);
        client.log("info", `${user.displayName} just went offline`);
      }
      prevStream = stream || null;
    }
  );
}
