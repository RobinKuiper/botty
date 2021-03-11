const EMOJI = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];
const colors = require("../../colors.json");

module.exports = {
  name: "poll",
  description: "Create a poll!",
  aliases: [],
  category: "fun",
  image: 'https://i.imgur.com/bKWLVOk.png',
  args: true,
  usage: [
      "question",
      "{question} [answer1] [answer2] [answer3]"
  ],
  guildOnly: true,
  cooldown: 5,
  async execute(message, args) {
    const channel = message.mentions.channels.first() || message.channel;

    const content = args.join(" "); //.splice(args.indexOf(`#${channel.name}`), 1)
    let question = content.match(/\{(.*?)\}/gm);
    const answers = content.match(/\[(.*?)\]/gm);

    let multiple = answers && answers.length > 0;

    let description = "";
    if (multiple) {
      question = question[0].replace(/\{(.*?)\}/gm, "$1");
      for(let i = 0; i < answers.length; i++){
          description += `${EMOJI[i]} ${answers[i].replace(/\[(.*?)\]/gm, "$1")}\n`
      }
    } else question = content.replace(/<(.*?)> /gm, "");

    const embed = {
      color: colors[Math.floor(Math.random()*colors.length)].hex,

      title: `__${question}__`,
      description,
    };

    const m = await channel.send({ embed });

    if (multiple) {
      for (let i = 0; i < answers.length; i++) {
        await m.react(EMOJI[i]);
      }
    } else {
      await m.react("👍");
      await m.react("👎");
    }

    /*let m = message.channel.send({ embed: embed }).then(async (m) => {
      const filter = (reaction, user) => {
        return ["👍", "👎"].includes(reaction.emoji.name) && !user.bot;
      };

      const collector = m.createReactionCollector(filter, { time: 5000 });

      collector.on('collect', (reaction, user) => {
        console.log(`${user.tag} voted for ${reaction.emoji.name}`);
        switch(reaction.emoji.name){
            case '👍':
                
            break;

            case '👎':

            break;
        }
      });

      collector.on('end', collected => console.log(console.log(collected['👍'])));

      collector.on("collect", (reaction, user) => {
        if (reaction.emoji.name === "🛑")
          postServerCommand("stop", server, message);
        if (reaction.emoji.name === "▶️")
          postServerCommand("start", server, message);
        if (reaction.emoji.name === "♻️")
          postServerCommand("restart", server, message);
      });

      await m.react("👍");
      await m.react("👎");
    });*/
  },
};
