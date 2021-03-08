module.exports = {
    name: 'dice',
    description: 'Roll your dice!',
    aliases: ['d', 'roll', 'r'],
    args: true,
    usage: "1d6",
    guildOnly: false,
    cooldown: 0,
    execute(message, args) {
        const die = getDie(args[0].toLowerCase());

        let solution = 0;
        let numberString = "";
        for(let i = 0; i < die.howMany; i++){
            let number = Math.floor(Math.random() * die.dice) + 1;
            numberString += number;
            if(i < die.howMany-1) numberString += ', ';
            solution += number+die.modifier;
        }
        
        message.channel.send(`${numberString}\n${args[0]}: ${solution}`);
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