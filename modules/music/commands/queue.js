module.exports = {
  name: "queue",
  description: "",
  aliases: [],
  category: "games",
  args: false,
  image:
    "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png",
  usage: "",
  guildOnly: true,
  cooldown: 0,
  execute(message, args, client) {
    let queue = client.music.getQueue(message);
    if (queue === undefined)
      return message.reply(`There is nothing in the queue right now!`);

    const embed = {
      color: 0x0099ff,
      title: "🎶 Queue 🎶",
      description: `${queue.songs
        .map((song, id) => {
          if (id === 0)
            return `**Now Playing**\n${song.name} - \`${song.formattedDuration}\`\n`;
          else
            return `**Up Next**\n**${id + 1}**. ${song.name} - \`${
              song.formattedDuration
            }\``;
        })
        .slice(0, 10)
        .join("\n")}`,
      thumbnail: {
        url:
          "https://cdn.shopify.com/s/files/1/1061/1924/products/Musical_Notes_Emoji_grande.png?v=1571606064",
      },
      /*image: {
        url: 'https://i.imgur.com/wSTFkRM.png',
      },*/
      footer: {
        text: `Songs: ${queue.songs.length} | Duration: ${
          queue.formattedDuration
        } ${queue.pause ? "| Paused" : ""}`,
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
  },
};
