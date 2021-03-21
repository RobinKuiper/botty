const fs = require("fs");
const path = require("path");
const Fuse = require("fuse.js");

const EMOJI = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

module.exports = {
  name: "feat",
  description: "Feat Information",
  aliases: [],
  args: true,
  category: "fun",
  image: "https://i.imgur.com/SDN44F6.png",
  usage: "Dual Wielder",
  guildOnly: false,
  cooldown: 0,
  init(client) {
    const featsPath = path.join(
      client.folders.modules,
      "dnd",
      "data",
      "feats.json"
    );
    let feats = [];

    if (fs.existsSync(featsPath))
        feats = require(featsPath).feat;

    const options = {
      // isCaseSensitive: false,
      includeScore: true,
      // shouldSort: true,
      // includeMatches: false,
      // findAllMatches: false,
      minMatchCharLength: 2,
      // location: 0,
      threshold: 0.4,
      // distance: 100,
      // useExtendedSearch: false,
      // ignoreLocation: false,
      // ignoreFieldNorm: false,
      keys: ["name"],
    };

    this.fuse = new Fuse(feats, options);
  },
  execute(message, args, client) {
    const results = this.fuse.search(args.join(" "));

    if (results[0].score <= 0.1) {
      const feat = results[0].item;

      this.sendFeat(feat, message, client);
    } else {
      const embed = {
        color:
          client.colors[Math.floor(Math.random() * client.colors.length)].hex,
        title: `Which one are you looking for?`,
        description: results.map((r, i) => `${EMOJI[i]} ${r.item.name}`).join('\n'),
      };

      return message.reply({ embed }).then(async (m) => {
        const filter = (reaction, user) =>
          EMOJI.includes(reaction.emoji.name) && !user.bot;

        const collector = m.createReactionCollector(filter);

        collector.on("collect", (reaction) => {
          const feat = results[EMOJI.indexOf(reaction.emoji.name)].item;
          this.sendFeat(feat, message, client);
        });

        for (let i = 0; i < results.length; i++) {
          await m.react(EMOJI[i]);
        }
      });
    }
  },
  sendFeat(feat, message, client){
    console.log(feat);

    let description = '';

    for(let i = 0; i < feat.entries.length; i++){
      let entry = feat.entries[i];

      if(typeof entry === 'string') description += `${entry}\n`;
      if(typeof entry === 'object'){
        if(entry.type && entry.type === 'list'){
          description += '\n';
          for(let j = 0; j < entry.items.length; j++){
            description += `  *‣ ${entry.items[j]}*\n`
          }
          description += '\n';
        }
      }
    }

      const embed = {
        color:
          client.colors[Math.floor(Math.random() * client.colors.length)].hex,
        title: `${feat.name} ${feat.meta && feat.meta.ritual ? "®️" : ''}`,
        description,
        footer: {
          text: `Source: ${feat.source}, page ${feat.page}`,
        },
      };

      return message.reply({ embed });
  }
};
