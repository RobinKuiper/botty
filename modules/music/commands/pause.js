module.exports = {
  name: "pause",
  description: "",
  aliases: [],
  category: "games",
  args: false,
  image:
    "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png",
  usage: "",
  guildOnly: true,
  cooldown: 0,
  init(client) {
    
  },
  execute(message, args, client) {
    let queue = client.music.getQueue(message);
    if (queue === undefined) return message.reply(`There is nothing in the queue right now!`)
        if (queue.pause) {
            client.music.resume(message)
        }
        client.music.pause(message)
  },
};
