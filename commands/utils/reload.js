const fs = require('fs');

module.exports = {
	name: 'reload',
	description: 'Reloads a command',
	execute(message, args) {

        const commandFolders = fs.readdirSync('./commands');
        
        if(!args.length){
            reloadCommands(message, commandFolders);
        }else if(args[0] === "events"){
            reloadEvents(message);
        }else if(args[0] === "commands"){
            reloadCommands(message, commandFolders);
        }else{
            const commandName = args[0].toLowerCase();
            const command = message.client.commands.get(commandName)
                || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

            const folderName = commandFolders.find(folder => fs.readdirSync(`./commands/${folder}`).includes(`${commandName}.js`));

            delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)];

            try {
                const newCommand = require(`../${folderName}/${command.name}.js`);
                message.client.commands.set(newCommand.name, newCommand);
                message.channel.send(`Command \`${command.name}\` was reloaded!`);
            } catch (error) {
                console.error(error);
                message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
            }
        }

	},
};

function reloadCommands(message, commandFolders){
    for(const folder of commandFolders){
        const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
        for(const file of commandFiles){
            delete require.cache[require.resolve(`../${folder}/${file}`)];

            try{
                const command = require(`../${folder}/${file}`);
                message.client.commands.set(command.name, command);
                message.channel.send(`Command \`${command.name}\` was reloaded!`);
            }catch(error){
                console.error(error);
                message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
            }
        }
    }
}

function reloadEvents(message){
        const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
        for(const file of eventFiles){
            delete require.cache[require.resolve(`../../events/${file}`)];

            try{
                const event = require(`../../events/${file}`);
                message.client.commands.set(event.name, event);
                message.channel.send(`Event \`${event.name}\` was reloaded!`);
            }catch(error){
                console.error(error);
                message.channel.send(`There was an error while reloading an event \`${event.name}\`:\n\`${error.message}\``);
            }
        }
}