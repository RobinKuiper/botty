// TODO: Refactor

/* eslint-disable no-case-declarations */
const request = require("request");

module.exports = {
  name: "foundry",
  description:
    "- get foundry information",
  aliases: ["dnd"],
  category: "games",
  args: false,
  image:
    "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png",
  usage: '',
  guildOnly: true,
  cooldown: 5,
  init(client) {
    //client.info(`[${this.name}] Initializing.`);
  },
  execute(message, args, client) {
    request(
      `https://foundry.robinkuiper.eu/`,
      { json: false, rejectUnhauthorized: false },
      (err, res, body) => {
        if (err) return console.log(err);
  
        return console.log(/<h1>(.*?)<\/h1>/gm.exec(body)[1]);
      }
    );
  }
};

//header#world-title h1 (wold name)
//header h1     (Foundry Virtual Tabletop - Configuration and Setup)

// Setup before login - Foundry Virtual Tabletop &bull; Administrator Access
// In game - worldname