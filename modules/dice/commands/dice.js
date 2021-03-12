const colors = require("../../../colors.json");

module.exports = {
    name: 'dice',
    description: 'Roll your dice!',
    aliases: ['d', 'roll', 'r'],
    args: true,
    category: "fun",
    image: 'https://i.imgur.com/SDN44F6.png',
    usage: "1d6+4",
    guildOnly: false,
    cooldown: 0,
    execute(message, args) {
        const die = getDie(args[0].toLowerCase());

        const rolls = [];
        for (let i = 0; i < die.howMany; i++) {
            rolls.push(Math.floor(Math.random() * die.dice) + 1);
        }

        const sum = rolls.reduce((a, b) => a+b, 0);

        const description = `**Rolls:** ${rolls.join(", ")}`;

        const embed = {
            color: colors[Math.floor(Math.random()*colors.length)].hex,
            title: `🎲 __${sum}__ 🎲`,
            description,
            footer: {
                text: args[0]
            }
          };
        
          message.channel.send({ embed })
    },
};

function getDie(dieSpec) {
    var match = /^(\d+)?d(\d+)([+-]\d+)?$/.exec(dieSpec);
    if (!match) {
        throw "Invalid dice notation: " + dieSpec;
    }

    return {
        howMany: (typeof match[1] == 'undefined') ? 1 : parseInt(match[1]),
        dice: parseInt(match[2]),
        modifier: (typeof match[3] == 'undefined') ? 0 : parseInt(match[3])
    }
}