/*
request('https://foundry.robinkuiper.eu', (err, res, body) => {
    if(body.includes("Administrator Access")){
        console.log("No game running, in admin login.");
    }else{
        let game = body.match(/<h1>(.*?)<\/h1>/gm);

        if(game && game.length > 0){
            console.log(game[0].replace(/<h1>(.*?)<\/h1>/gm, "$1"));
        }
    }
})
*/

const EMOJI = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];
const colors = require("../../colors.json");

module.exports = {
  name: "foundry",
  description: "Get foundry info!",
  aliases: [],
  category: "games",
  image: 'https://i.imgur.com/bKWLVOk.png',
  args: true,
  usage: [],
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
  },
};
