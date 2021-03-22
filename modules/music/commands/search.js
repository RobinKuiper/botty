module.exports = {
  name: "search",
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
    try{
      client.music.search(args.join(" ")).then(results => {
        console.log(results);
      });
    }catch(e){
      message.reply(e);
    }
  },
};
