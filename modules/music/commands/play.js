module.exports = {
  name: "play",
  description: "",
  aliases: [],
  category: "games",
  args: false,
  image:
    "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png",
  usage: "",
  guildOnly: true,
  cooldown: 0,
  init(client) {},
  execute(message, args, client) {
    if (!args.length)
      return message.reply(
        "Please enter a song url or query to the search, eg. `!play eminem`"
      );

    try {
      client.music.play(message, args.join(" "));
    } catch (e) {
      message.channel.send(`Error: \`${e}\``);
    }
  },
};
