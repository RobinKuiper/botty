const colors = require('../../colors.json');

let prefix = '!';

module.exports = {
    name: 'help',
    description: "List of all commands or info about a specific command",
    aliases: ['commands'],
    usage: '[command name]',
    image: 'https://i.imgur.com/IHkfgzl.png',
    cooldown: 5,
    init(client){
        prefix = client.config.get('prefix') || prefix;
    },
    execute(message, args){
        const data = [];
        const { commands } = message.client;
        
        if(!args.length){

            let description = `
            ${commands.filter(c => c.inHelp !== false).map(command => command.name).join('\n')}
        `

        const embed = {
            color: colors[Math.floor(Math.random()*colors.length)].hex,
            title: `__Commands__`,
            description,
            thumbnail: {
                url: 'https://i.imgur.com/IHkfgzl.png',
            },
            footer: {
                text: `You can send \`${prefix}help [command]\` to get info on a specific command.`
            }
        }

            return message.channel.send({ embed })
                /*.then(() => {
                    if(message.channel.type === "dm") return;
                    message.reply('I\'ve send you a DM with all my commands.');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                })*/
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if(!command){
            return message.reply('I\'ve never heard of that command.');
        }

        let usage = [];
        if(Array.isArray(command.usage)){
            for(let i = 0; i < command.usage.length; i++){
                usage.push(`${prefix}${command.name} ${command.usage[i]}`)
            }
        }else
            usage.push(`${prefix}${command.name} ${command.usage}`);

        let description = ``;

        if(command.aliases && command.aliases.length > 0) description += `**Aliases:** *${command.aliases.join(', ')}*\n\n`;
        if(command.description && command.description.length > 3) description += `**Description:**\n*${command.description}*\n\n`;
        if(command.usage) description += `**Usage:**\n*${usage.join('\n')}*\n\n`;

        description += `**Cooldown:** *${command.cooldown || 3} second(s)*`;

        const embed = {
            color: colors[Math.floor(Math.random()*colors.length)].hex,
            title: `__Help: ${command.name.charAt(0).toUpperCase() + command.name.slice(1)}__`,
            description,
            thumbnail: {
                url: command.image || 'https://steemitimages.com/DQmWoqx8Qt95BnXmLzaqQu7HFcp8pngYZM2CCosoavfn4JL/depositphotos_79132680-stock-illustration-noob-red-stamp-text.jpg',
            },
        }

        message.channel.send({ embed });
    }
}