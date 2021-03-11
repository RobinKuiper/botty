const { mainChannel } = require("../config.json");

let temporary = [];

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldState, newState, client) {
    let oldChannel = oldState.channelID ? oldState.channelID : null;
    let newChannel = newState.channelID ? newState.channelID : null;
    if(oldChannel === newChannel) return;

    if (temporary.length > 0) {
      temporary = temporary.sort((a,b) => a-b);
      for (let i = 0; i < temporary.length; i++) {
        let channel = temporary[i].guild.channels.cache.find(
          (ch) => ch.id == temporary[i].channelID
        );

        if (channel.members.size <= 0) {
          channel.delete();
          temporary.splice(i, 1);
        }
      }
    }

    if (
      newState.channelID === mainChannel ||
      temporary.find((x) => x.channelID === newState.channelID)
    ) {
      if (!emptyChannels(newState.guild)) {
        client.channels.cache
          .get(mainChannel)
          .clone({ name: `Gaming ${temporary.length + 2}` })
          .then((channel) => {
            channel.setPosition(temporary.length + 1, { relative: false });
            temporary.push({ channelID: channel.id, guild: channel.guild });
          });
      }
    }
  },
};

function emptyChannels(guild) {
  if (guild.channels.cache.find((ch) => ch.id == mainChannel).members.size <= 0)
    return true;

  for (let i = 0; i < temporary.length; i++) {
    if (
      guild.channels.cache.find((ch) => ch.id == temporary[i].channelID).members
        .size <= 0
    )
      return true;
  }

  return false;
}
