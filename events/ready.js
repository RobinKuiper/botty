module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        client.user.setUsername("Pieter");
        client.user.setActivity("Serving you!", { type: "WATCHING" });
        client.user.setStatus('online');
	},
};