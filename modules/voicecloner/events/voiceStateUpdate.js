const fs = require("fs");
const path = require("path");

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  channels: {},
  init(client) {
    client.info(`[${this.name}] Initializing voice channel cloner.`);

    this.file = path.join(client.folders.modules, "voicecloner/channels.json");
    this.channels = this.getChannelsFromFile(this.file);
  },
  async execute(oldState, newState, client) {
    this.client = client;

    let oldChannel = oldState.channelID ? oldState.channelID : null;
    let newChannel = newState.channelID ? newState.channelID : null;
    if (oldChannel === newChannel) return;

    if (this.channels[newState.channelID]) {
      // User joined accepted voice channel;

      // Get channel from file.
      let channel = this.channels[newState.channelID];

      if (typeof channel !== "object") {
        // Channel is a cloned channel, get main channel from file.
        channel = this.channels[channel];
      }

      const clones = channel.clones;
      // Check if channel has empty channels.
      if (!this.hasEmptyChannels(newState.guild, channel, clones)) {
        // No empty channels, clone the channel and write data to file.
        let mChannel = newState.guild.channels.cache.get(channel.id);
        mChannel
          .clone({ name: `${mChannel.name} ${clones.length + 2}` })
          .then((ch) => {
            ch.setPosition(mChannel.rawPosition + 1, { relative: false });
            this.channels[channel.id].clones.push(ch.id);
            this.channels[ch.id] = channel.id;

            fs.writeFileSync(this.file, JSON.stringify(this.channels, null, 4));
          });
      }
    }

    if (this.channels[oldState.channelID]) {
      // User left accepted voice channel;

      // Get channel from file.
      let channel = this.channels[oldState.channelID];

      if (typeof channel !== "object") {
        // Channel is a cloned channel, get main channel from file.
        channel = this.channels[channel];
      }

      // Get all clones from this channel
      const clones = channel.clones;
      // Count empty channels
      let emptyChannels = this.countEmptyChannels(oldState.guild, channel, clones);

      // Stop if there is only one empty channel
      if(emptyChannels <= 1) return;

      // Loop through clones and delete empties until there is only 1 empty channel left.
      for(let i = 0; i < clones.length; i++){
        if(emptyChannels === 1) break;

        let cloneID = clones[i];

        let clonedChannel = oldState.guild.channels.cache.get(cloneID);
        if(clonedChannel.members.size <= 0){
          clonedChannel.delete();
          this.channels[channel.id].clones.splice(i, 1);
          delete this.channels[cloneID];
          emptyChannels--;
        }
      }

      // Write back to file
      fs.writeFileSync(this.file, JSON.stringify(this.channels, null, 4));
    }
  },
  getChannelsFromFile(file) {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file));
    }

    return {};
  },
  hasEmptyChannels(guild, channel, clones) {
    if (
      guild.channels.cache.find((ch) => ch.id === channel.id).members.size <= 0
    )
      return true;

    for (let i = 0; i < clones.length; i++) {
      if (
        guild.channels.cache.find((ch) => ch.id === clones[i]).members.size <= 0
      )
        return true;
    }

    return false;
  },
  countEmptyChannels(guild, channel, clones) {
    let empty = 0;
    if (
      guild.channels.cache.find((ch) => ch.id === channel.id).members.size <= 0
    )
      empty++;

    for (let i = 0; i < clones.length; i++) {
      if (
        guild.channels.cache.find((ch) => ch.id === clones[i]).members.size <= 0
      )
        empty++;
    }

    return empty;
  },
};