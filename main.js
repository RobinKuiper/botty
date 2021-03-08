const config = require('./config.json');

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
    console.log("Ready!");
});

client.login(config.token);

client.on('message', message => {
    console.log(message);

    if(message.content === '!ping'){
        message.channel.send('Pong.');
    }
});