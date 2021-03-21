const fs = require("fs");
const path = require("path");
const Fuse = require("fuse.js");

const EMOJI = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

module.exports = {
  name: "spell",
  description: "Spell Information",
  aliases: [],
  args: true,
  category: "fun",
  image: "https://i.imgur.com/SDN44F6.png",
  usage: "Misty Step",
  guildOnly: false,
  cooldown: 0,
  init(client) {
    const spellsPath = path.join(
      client.folders.modules,
      "dnd",
      "data",
      "spells"
    );
    let spells = [];

    this.levels = {
      1: "1st",
      2: "2nd",
      3: "3th",
      4: "4th",
      5: "5th",
      6: "6th",
      7: "7th",
      8: "8th",
      9: "9th",
    };

    this.schools = {
      a: "Abjuration",
      c: "Conjuration",
      n: "Necromancy",
      e: "Evocation",
      t: "Transmutation",
      d: "Divination",
      e: "Enchantment",
      i: "Illusion",
    };

    if (fs.existsSync(spellsPath)) {
      for (let file of fs
        .readdirSync(spellsPath)
        .filter((f) => f.endsWith(".json"))) {
        if (file === "index.json" || file === "fluff-index.json") continue;

        let list = require(path.join(spellsPath, file));

        if (!list.spell) continue;

        for (let i = 0; i < list.spell.length; i++) {
          const spell = list.spell[i];

          let inArray = false;
          for (let j = 0; j < spells.length; j++) {
            if (spells[j].name.toLowerCase() === spell.name.toLowerCase()) {
              spells[j] = Object.assign(spells[j], spell);
              inArray = true;
            }
          }

          if (!inArray) {
            spells.push(spell);
          }
        }
      }
    }

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

    this.fuse = new Fuse(spells, options);
  },
  execute(message, args, client) {
    const results = this.fuse.search(args.join(" "));

    if(!results.length) return message.reply('Nothing found...');

    if (results[0].score <= 0.01 || results.length === 1) {
      const spell = results[0].item;

      this.sendSpell(spell, message, client);
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
          const spell = results[EMOJI.indexOf(reaction.emoji.name)].item;
          this.sendSpell(spell, message, client);
        });

        for (let i = 0; i < results.length; i++) {
          await m.react(EMOJI[i]);
        }
      });
    }
  },
  sendSpell(spell, message, client){
    console.log(spell);

      let range = "";
      if (spell.range.type === "point") {
        range =
          spell.range.distance.type === "touch"
            ? "Touch"
            : spell.range.distance.type === "self"
            ? "Self"
            : `${spell.range.distance.amount} ${spell.range.distance.type}`;
      } else if (spell.range.type === "radius")
        range = `Self (${spell.range.distance.amount} ${
          spell.range.distance.type === "feet"
            ? "foot"
            : spell.range.distance.type
        } radius)`;
      else if(spell.range.type === "hemisphere")
      range = `Self (${spell.range.distance.amount} ${
        spell.range.distance.type === "feet"
          ? "foot"
          : spell.range.distance.type
      } radius hemisphere)`;

      let duration = "";
      if (spell.duration[0].type === "instant") duration = "Instantaneous";
      else if (spell.duration[0].type === "timed")
        duration = `${spell.duration[0].duration.amount} ${spell.duration[0].duration.type}`;
      else if (spell.duration[0].type === "permanent") {
        duration = spell.duration[0].ends
          .map((e) => {
            if (e === "dispel") return "Until dispelled";
            if (e === "trigger") return "triggered";
          })
          .join("or ");
      } else if (spell.duration[0].type === "special") duration = "Special";

      let description = spell.entries.join(' ');
      if(spell.entriesHigherLevel){
        if(spell.entriesHigherLevel[0].type === 'entries'){
          description += '\n\n**At Higher Levels.**';
          description += spell.entriesHigherLevel[0].entries.join(' ');
        }
      }

      const embed = {
        color:
          client.colors[Math.floor(Math.random() * client.colors.length)].hex,
        title: `${spell.name} ${spell.meta && spell.meta.ritual ? "®️" : ''}`,
        author: {
          name: `${this.levels[spell.level]}-level ${
            this.schools[spell.school.toLowerCase()]
          }`,
        },
        description,
        fields: [
          {
            name: "Casting Time",
            value: `${spell.time[0].number} ${spell.time[0].unit}`,
            inline: true,
          },
          {
            name: "Range",
            value: range || 'error',
            inline: true,
          },
          {
            name: 'Duration',
            value: duration || 'error',
            inline: true,
          },
          {
            name: "Components",
            value: `${spell.components.v ? "V" : ''} ${spell.components.s ? "S" : ''} ${spell.components.m ? `M (${spell.components.m})}` : ''}`,
            inline: true,
          },
        ],
        footer: {
          text: `Source: ${spell.source}, page ${spell.page}`,
        },
      };

      return message.reply({ embed });
  }
};
