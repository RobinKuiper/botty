const fs = require("fs");

exports.index = (req, res, client) => {
  const _token = req.query.token;

  const channels = [];
  client.bot.guilds.cache
    .first()
    .channels.cache.filter((c) => c.type === "text")
    .forEach((c) => {
      channels.push({ id: c.id, name: c.name });
    });

  let modules = null;

  if (fs.existsSync("config/modules.json"))
    modules = JSON.parse(fs.readFileSync("config/modules.json"));

  res.render("index", { title: "", token: _token, channels, modules });
};
