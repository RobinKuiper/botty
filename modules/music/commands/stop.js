module.exports = {
  name: "stop",
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
    let queue = client.music.getQueue(message);
    if (queue === undefined) return message.reply(`There is nothing in the queue right now!`)
        
    client.music.stop(message);
  },
};
