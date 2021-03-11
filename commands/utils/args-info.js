module.exports = {
    name: 'args-info',
    description: 'Informmation about the arguments provided',
    aliases: ['args', 'ainfo'],
    args: true,
    usage: "foo",
    guildOnly: true,
    cooldown: 5,
    inHelp: false,
    permissions: "CHECK_ARGS",
    execute(message, args) {
        if(args[0] === 'foo'){
            return message.channel.send('bar');
        }

        message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
    }
};