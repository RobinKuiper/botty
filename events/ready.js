const { username, state, activity, avatar } = require("../config.json");

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        client.user.setUsername(username);
        client.user.setActivity(activity);
        client.user.setStatus(state);
        client.user.setAvatar(avatar);
	},
};