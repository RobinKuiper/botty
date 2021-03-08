const fs = require("fs");
const { token } = require('./config.json');

const Discord = require('discord.js');
const client = new Discord.Client();

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for(const file of eventFiles){
    const event = require(`./events/${file}`);
    if(event.once){
        client.once(event.name, (...args) => event.execute(...args, client));
    }else{
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.cooldowns = new Discord.Collection();

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');

for(const folder of commandFolders){
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for(const file of commandFiles){
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

client.login(token);