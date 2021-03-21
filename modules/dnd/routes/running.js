const games = require("./../games.json");
const fs = require("fs");

module.exports = {
  route: "running",
  type: "post",
  execute(req, res, client) {
    const { name, title, description, system, id } = req.body;

    if (!games[name]) {
      games[name] = {
        name,
        title,
        description,
        system,
        id,
        channel: "",
        guild: "",
        embed: {},
        last_announced: null,
        announce: false
      };

      return fs.writeFileSync(
        "modules/foundry/games.json",
        JSON.stringify(games, null, 4)
      );
    }

    const game = games[name];

    if(!game.announce) return client.info('We don\'t want to announce this game.');

    if(game.last_announced && Date.now() - game.last_announced <= 3 * 60 * 60 * 1000) return client.info('We have announced this already.');

    games[name].last_announced = Date.now();

    fs.writeFileSync("modules/foundry/games.json", JSON.stringify(games, null, 4));

    let embed = {
      color: "#C4530E",
      title,
      url: "https://foundry.robinkuiper.eu",
      author: {
        name: "Game Started",
        url: "https://foundry.robinkuiper.eu",
        icon_url:
          "https://static-cdn.jtvnw.net/jtv_user_pictures/e8e192e5-59bf-428b-a523-03f483548d2b-profile_image-300x300.png",
      },
      description,
      thumbnail: {
        url:
          "https://static-cdn.jtvnw.net/jtv_user_pictures/e8e192e5-59bf-428b-a523-03f483548d2b-profile_image-300x300.png",
      },
      footer: {
        text: "FoundryVTT",
        icon_url:
          "https://static-cdn.jtvnw.net/jtv_user_pictures/e8e192e5-59bf-428b-a523-03f483548d2b-profile_image-300x300.png",
      },
    };

    embed = Object.assign(embed, game.embed);

    const guild = client.bot.guilds.cache.get(game.guild);
    if (!guild) return;
    const channel = guild.channels.cache.get(game.channel);
    if (!channel) return;

    channel.send({ embed });
  },
};
