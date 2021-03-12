const Discord = require('discord.js');

module.exports = {
    name: 'level',
    description: 'Get your or someone else\'s level.',
    aliases: [],
    args: false,
    usage: "[user]",
    guildOnly: true,
    cooldown: 5,
    execute(message, args, client) {
        const embed = new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setTitle("Level")
            .addFields(
                { name: 'Level', value: client.userList.getLevel(message.author.id), inline: true }
            )

        message.channel.send(embed);
    }
};