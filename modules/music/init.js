const distube = require("distube");

class init {
  constructor(client) {
    const status = (queue) =>
      `Volume: \`${queue.volume}%\` | Filter: \`${
        queue.filter || "Off"
      }\` | Loop: \`${
        queue.repeatMode
          ? queue.repeatMode == 2
            ? "All Queue"
            : "This Song"
          : "Off"
      }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

    client.music = new distube(client.bot, {
      searchSongs: true,
      emitNewSongOnly: true,
    });

    client.music
      .on("playSong", (message, queue, song) => {
        this.announceSong(client, message, song, '🎶 Now Playing 🎶');
      })

      .on("addSong", (message, queue, song) => {
        this.announceSong(client, message, song, '🎶 Added 🎶');
      })
      .on("playList", (message, queue, playlist, song) => {
        this.announceSong(client, message, song, '🎶 Now Playing 🎶');
      })
      .on("addList", (message, queue, playlist) =>
        message.channel.send(
          `Added \`${playlist.name}\` playlist (${
            playlist.songs.length
          } songs) to queue\n${status(queue)}`
        )
      )
      // DisTubeOptions.searchSongs = true
      .on("searchResult", (message, result) => {
        const embed = {
          color:
            client.colors[Math.floor(Math.random() * client.colors.length)].hex,
          title: "🎶 Search Results 🎶",
          description: `
          Enter the number of the song you want to add:\n
          ${result
            .map(
              (song, i) =>
                `**${++i}**. ${song.name} - \`${song.formattedDuration}\``
            )
            .join("\n")}`,
          footer: {
            text: `Enter anything else or wait 60 seconds to cancel search.`,
          },
        };

        message.channel.send({ embed });
      })
      // DisTubeOptions.searchSongs = true
      .on("searchCancel", (message) =>
        message.channel.send(`Searching canceled`)
      )
      .on("error", (message, e) => {
        console.error(e);
        message.channel.send("An error encountered: " + e);
      });
  }

  announceSong (client, message, song, title){
    const embed = {
      color:
        client.colors[Math.floor(Math.random() * client.colors.length)].hex,
      title: title,
      url: song.url,
      description: `**${song.name}** - \`${song.formattedDuration}\``,
      thumbnail: {
        url: song.thumbnail,
      },
      footer: {
        text: `Requested by: ${song.user}`,
      },
    };

    message.channel.send({ embed }).then(async (m) => {
      const filter = (reaction, user) => {
        return (
          ["⏯️", "⏭️", "⏹️"].includes(reaction.emoji.name) &&
          user.id === message.author.id &&
          !user.bot
        );
      };

      const collector = m.createReactionCollector(filter);

      collector.on("collect", (reaction) => {
        if (reaction.emoji.name === "⏯️")
          if (client.music.isPaused(m)) client.music.resume(m);
          else client.music.pause(m);
        if (reaction.emoji.name === "⏹️") client.music.stop(m);
        if (reaction.emoji.name === "⏭️") client.music.skip(m);
      });

      await m.react("⏯️");
      await m.react("⏹️");
      await m.react("⏭️");
    });
  }
}

module.exports = init;
