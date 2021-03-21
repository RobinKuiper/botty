const { DiceRoll, exportFormats } = require("rpg-dice-roller");

module.exports = {
  name: "dice",
  description: "Roll your dice!",
  aliases: ["d", "roll", "r"],
  args: true,
  category: "fun",
  image: "https://i.imgur.com/SDN44F6.png",
  usage: "1d6+4",
  guildOnly: false,
  cooldown: 0,
  execute(message, args, client) {
    if (args[0].toLowerCase() === "abilities") {
      const rolls = [];
      let total = 0;
      for (let i = 0; i < 6; i++) {
        let roll = new DiceRoll("4d6dl1").export(exportFormats.OBJECT);
        rolls.push(roll);
        total += roll.total;
      }

      const fields = rolls.map((r) => {
        return {
          value: `*[${r.rolls[0].rolls
            .map((rs) => (rs.useInTotal ? rs.value : `~~${rs.value}~~`))
            .join(", ")}]*`,
          name: r.total,
          inline: true,
        };
      });

      const embed = {
        color:
          client.colors[Math.floor(Math.random() * client.colors.length)].hex,
        title: `🎲 Abilities 🎲`,
        fields,
        footer: {
          text: `Total: ${total}`,
        },
      };

      return message.reply({ embed });
    } else {
      let disadvantage = false,
        advantage = false;

      if (args[1]) {
        if (args[1].includes("dis")) disadvantage = true;
        else if (args[1].includes("adv")) advantage = true;
      }

      let roll = new DiceRoll(args[0]).export(exportFormats.OBJECT),
        roll2;
      if (advantage || disadvantage)
        roll2 = new DiceRoll(args[0]).export(exportFormats.OBJECT);

      let fields = "",
        description = "", total;

      if (advantage || disadvantage) {
          total = advantage ? roll.total > roll2.total ? roll.total : roll2.total : roll.total < roll2.total ? roll.total : roll2.total;

          fields = [
            {
                value: advantage ? roll.total >= roll2.total ? roll.total : `~~${roll.total}~~` : roll.total <= roll2.total ? roll.total : `~~${roll.total}~~`,
                name: "__󠀠‏‎", // --- ‎--- ‏White space found with send empty whatsapp message
                inline: true
            },
            {
                value: advantage ? roll2.total >= roll.total ? roll2.total : `~~${roll2.total}~~` : roll2.total <= roll.total ? roll2.total : `~~${roll2.total}~~`,
                name: "__󠀠‏‏‎",
                inline: true
            }
          ]
      } else {
        total = roll.total;

        if (roll.rolls[0].rolls && roll.rolls[0].rolls.length) {
          const rolls = roll.rolls[0].rolls.map((r) =>
            r.useInTotal ? `**${r.value}**` : `~~${r.value}~~`
          );

          description = `**Rolls:** ${rolls.join(", ")}`;
        }
      }

      const embed = {
        color:
          client.colors[Math.floor(Math.random() * client.colors.length)].hex,
        title: `🎲 __${total}__ 🎲`,
        description,
        fields,
        footer: {
          text: args[0],
        },
      };

      return message.reply({ embed });
    }
  },
};