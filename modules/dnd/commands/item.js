const fs = require("fs");
const path = require("path");
const Fuse = require("fuse.js");

const EMOJI = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

module.exports = {
  name: "item",
  description: "Item Information",
  aliases: [],
  args: true,
  category: "fun",
  image: "https://i.imgur.com/SDN44F6.png",
  usage: "ration",
  guildOnly: false,
  cooldown: 0,
  init(client) {
    const itemsPath = path.join(
      client.folders.modules,
      "dnd",
      "data",
      "items.json"
    );
    let items = [];

    if (fs.existsSync(itemsPath))
        items = require(itemsPath).item;

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

    this.fuse = new Fuse(items, options);
  },
  execute(message, args, client) {
    const results = this.fuse.search(args.join(" "));

    if(!results.length) return message.reply('Nothing found...');

    if (results[0].score <= 0.01 || results.length === 1) {
      const item = results[0].item;

      this.sendItem(item, message, client);
    } else {
      const embed = {
        color:
          client.colors[Math.floor(Math.random() * client.colors.length)].hex,
        title: `Which one are you looking for?`,
        description: results.map((r, i) => {
          if(i < 7)
          return `${EMOJI[i]} ${r.item.name}`
        }).join('\n'),
      };

      return message.reply({ embed }).then(async (m) => {
        const filter = (reaction, user) =>
          EMOJI.includes(reaction.emoji.name) && !user.bot;

        const collector = m.createReactionCollector(filter);

        collector.on("collect", (reaction) => {
          const item = results[EMOJI.indexOf(reaction.emoji.name)].item;
          this.sendItem(item, message, client);
        });

        for (let i = 0; i < results.length; i++) {
          await m.react(EMOJI[i]);
        }
      });
    }
  },
  sendItem(item, message, client){
    let description = '';

    if(item.entries){
    for(let i = 0; i < item.entries.length; i++){
      let entry = item.entries[i];

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
  }

    let name = '';

    if(item.wondrous)
      name += 'Wondrous item,';
    name += item.rarity;
    if(item.reqAttune)
    name += typeof item.reqAttune === 'string' ? `(requires attunement ${item.reqAttune})` : '(requires attinement)';
    if(item.weight)
    name += `, ${item.weight} lb.`;

      const embed = {
        color:
          client.colors[Math.floor(Math.random() * client.colors.length)].hex,
          author: {
            name
          },
        title: `${item.name} ${item.meta && item.meta.ritual ? "®️" : ''}`,
        description,
        footer: {
          text: `Source: ${item.source}, page ${item.page}`,
        },
      };

      return message.reply({ embed });
  }
};
