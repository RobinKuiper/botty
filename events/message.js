const Discord = require("discord.js");

let prefix = '!';

module.exports = {
  name: "message",
  init(client){
    client.log('info', 'Listening to messages...');
    prefix = client.config.get('prefix') || prefix;
},
  execute(message, client) {
    /*if (!message.author.bot) {
      client.userList.addExperience(message.author.id, 1)
        .then(levelUp => {
          if (levelUp) {
            const levelUpEmbed = new Discord.MessageEmbed()
              .setColor("#ff0000")
              .setTitle("LEVEL UP!");
    
            message.channel.send(levelUpEmbed);
          }
        });
    }*/

    client.log('info',
      `${message.author.tag} in #${message.channel.name} sent: ${message.content}`
    );
    
    client.log('info', `Guild ID: ${message.channel.guild.id}`)
    client.log('info', `Channel ID: ${message.channel.id}`)

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (!command) return;

    if (command.permissions) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
        return message.reply("You can not do this!");
      }
    }

    if (command.guildOnly && message.channel.type === "dm") {
      return message.reply("I can't execute that command inside DMs!");
    }

    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(
          `please wait ${timeLeft.toFixed(
            1
          )} more second(s) before reusing the \`${command.name}\` command.`
        );
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments.`;
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
      }

      return message.channel.send(reply);
    }

    try {
      command.execute(message, args, client);
    } catch (err) {
      console.error(err);
      message.reply("There was an error trying to execute that command!");
    }
  },
};
